import * as adminRolesRepository from './admin-roles.repository.js';
import * as adminCredentialsRepository from './admin-credentials.repository.js';
import * as usersRepository from '../users/users.repository.js';
import { hashPassword } from '../../utils/password.js';
import { encrypt, decrypt } from '../../utils/crypto.js';
import pool from '../../config/database.js';

const MODULES = ['users', 'events', 'registrations', 'payments', 'categories', 'reports', 'feedback'];
const ACTIONS = ['view', 'create', 'update', 'delete', 'approve', 'export', 'manage'];

export const getAll = async () => {
  const roles = await adminRolesRepository.findAll();
  const grouped = await adminCredentialsRepository.findAllGroupedByRole();
  const accountMap = {};
  for (const g of grouped) {
    for (const acc of g.accounts) {
      if (acc.passwordEncrypted) {
        try {
          acc.password = decrypt(acc.passwordEncrypted);
        } catch {
          acc.password = '\u2014';
        }
      } else {
        acc.password = '\u2014';
      }
      delete acc.passwordEncrypted;
    }
    accountMap[g.roleId] = g.accounts;
  }

  for (const role of roles) {
    role.assignedCount = await adminRolesRepository.countRoleAssignments(role.id);
    if (typeof role.permissions === 'string') {
      role.permissions = JSON.parse(role.permissions);
    }
    role.accounts = accountMap[role.id] || [];
  }
  return roles;
};

export const getById = async (id) => {
  const role = await adminRolesRepository.findById(id);
  if (!role) {
    const err = new Error('Role not found');
    err.statusCode = 404;
    throw err;
  }
  if (typeof role.permissions === 'string') {
    role.permissions = JSON.parse(role.permissions);
  }
  role.assignedUsers = await adminRolesRepository.getAssignedUsers(id);
  return role;
};

export const create = async ({ name, description, permissions, email, password, fullName }, createdBy) => {
  if (!name || name.trim().length === 0) {
    const err = new Error('Role name is required');
    err.statusCode = 400;
    throw err;
  }

  const existing = await adminRolesRepository.findByName(name);
  if (existing) {
    const err = new Error('A role with this name already exists');
    err.statusCode = 409;
    throw err;
  }

  validatePermissions(permissions);

  const roleId = await adminRolesRepository.create({
    name: name.trim(),
    description: description || '',
    permissions,
    createdBy,
  });

  const role = await adminRolesRepository.findById(roleId);

  // If email + password provided, also create an admin account
  let account = null;
  if (email && password) {
    account = await createAdminAccount(
      { email, password, fullName: fullName || name.trim(), roleId },
      createdBy
    );
  }

  return { ...role, account };
};

export const update = async (id, { name, description, permissions }, user) => {
  const role = await adminRolesRepository.findById(id);
  if (!role) {
    const err = new Error('Role not found');
    err.statusCode = 404;
    throw err;
  }
  if (!name || name.trim().length === 0) {
    const err = new Error('Role name is required');
    err.statusCode = 400;
    throw err;
  }

  const existing = await adminRolesRepository.findByName(name);
  if (existing && existing.id !== Number(id)) {
    const err = new Error('A role with this name already exists');
    err.statusCode = 409;
    throw err;
  }

  if (permissions) validatePermissions(permissions);

  await adminRolesRepository.update(id, {
    name: name.trim(),
    description: description || '',
    permissions: permissions || role.permissions,
  });

  return adminRolesRepository.findById(id);
};

export const remove = async (id) => {
  const role = await adminRolesRepository.findById(id);
  if (!role) {
    const err = new Error('Role not found');
    err.statusCode = 404;
    throw err;
  }
  if (role.is_system) {
    const err = new Error('System roles cannot be deleted');
    err.statusCode = 403;
    throw err;
  }
  await adminRolesRepository.remove(id);
};

export const assignToUser = async (userId, roleId, assignedBy) => {
  const user = await usersRepository.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const role = await adminRolesRepository.findById(roleId);
  if (!role) {
    const err = new Error('Role not found');
    err.statusCode = 404;
    throw err;
  }

  const existingRoles = await adminRolesRepository.getUserRoles(userId);
  if (existingRoles.some((r) => r.id === Number(roleId))) {
    const err = new Error('User already has this role');
    err.statusCode = 409;
    throw err;
  }

  await adminRolesRepository.assignRole(userId, roleId, assignedBy);
};

export const unassignFromUser = async (userId, roleId) => {
  await adminRolesRepository.unassignRole(userId, roleId);
};

export const getUserRoles = async (userId) => {
  const roles = await adminRolesRepository.getUserRoles(userId);
  for (const role of roles) {
    if (typeof role.permissions === 'string') {
      role.permissions = JSON.parse(role.permissions);
    }
  }
  return roles;
};

export const getUsersWithRoles = async () => {
  return adminRolesRepository.getUsersWithRoles();
};

export const getSchema = () => ({ modules: MODULES, actions: ACTIONS });

// ── Admin account management (credentials-based) ────────────────────────

export const getAccountsGroupedByRole = async () => {
  const groups = await adminCredentialsRepository.findAllGroupedByRole();
  for (const group of groups) {
    for (const account of group.accounts) {
      if (account.passwordEncrypted) {
        try {
          account.password = decrypt(account.passwordEncrypted);
        } catch {
          account.password = '\u2014';
        }
      } else {
        account.password = '\u2014';
      }
      delete account.passwordEncrypted;
    }
  }
  return groups;
};

export const createAdminAccount = async ({ email, password, fullName, roleId }, createdBy) => {
  if (!email || !password || !fullName || !roleId) {
    const err = new Error('email, password, fullName, and roleId are required');
    err.statusCode = 400;
    throw err;
  }
  if (password.length < 6) {
    const err = new Error('Password must be at least 6 characters');
    err.statusCode = 400;
    throw err;
  }

  const role = await adminRolesRepository.findById(roleId);
  if (!role) {
    const err = new Error('Role not found');
    err.statusCode = 404;
    throw err;
  }

  // Check for existing email
  const existingEmail = await usersRepository.findByEmail(email);
  if (existingEmail) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  // Generate a unique username from email
  let username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
  let existingUsername = await usersRepository.findByUsername(username);
  if (existingUsername) {
    username = `${username}_${Date.now()}`;
  }

  // Hash password for login, encrypt for storage
  const hashedPassword = await hashPassword(password);
  const encryptedPassword = encrypt(password);

  // Create user + assign role + store credentials in a transaction
  const [result] = await pool.query(
    `INSERT INTO users (username, email, password, fullName, role, status, isVerified)
     VALUES (?, ?, ?, ?, 'coordinator', 'active', ?)`,
    [username, email, hashedPassword, fullName, true]
  );
  const userId = result.insertId;

  await adminRolesRepository.assignRole(userId, roleId, createdBy);
  await adminCredentialsRepository.createCredential({
    userId,
    email,
    passwordEncrypted: encryptedPassword,
    createdBy,
  });

  return { userId, username, email, fullName, role: 'admin', password };
};

export const deleteAdminAccount = async (userId) => {
  const user = await usersRepository.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  await pool.query('DELETE FROM users WHERE id = ?', [userId]);
  // credentials are cascade-deleted via FK if they exist
};



function validatePermissions(permissions) {
  if (!permissions || typeof permissions !== 'object' || Array.isArray(permissions)) {
    const err = new Error('Permissions must be an object with module keys');
    err.statusCode = 400;
    throw err;
  }

  for (const [mod, actions] of Object.entries(permissions)) {
    if (!MODULES.includes(mod)) {
      const err = new Error(`Invalid module: "${mod}". Valid modules: ${MODULES.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }
    if (!Array.isArray(actions)) {
      const err = new Error(`Permissions for "${mod}" must be an array`);
      err.statusCode = 400;
      throw err;
    }
    for (const action of actions) {
      if (!ACTIONS.includes(action)) {
        const err = new Error(`Invalid action "${action}" for module "${mod}". Valid actions: ${ACTIONS.join(', ')}`);
        err.statusCode = 400;
        throw err;
      }
    }
  }
}
