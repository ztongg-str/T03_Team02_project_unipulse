import * as adminRolesService from './admin-roles.service.js';
import { success, created, error } from '../../utils/response.js';

export const getAll = async (req, res, next) => {
  try {
    const roles = await adminRolesService.getAll();
    return success(res, roles);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getById = async (req, res, next) => {
  try {
    const role = await adminRolesService.getById(req.params.id);
    return success(res, role);
  } catch (err) {
    return error(res, err.message, err.statusCode || 404);
  }
};

export const create = async (req, res, next) => {
  try {
    const role = await adminRolesService.create(req.body, req.user.id);
    return created(res, role, 'Role created successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const update = async (req, res, next) => {
  try {
    const role = await adminRolesService.update(req.params.id, req.body, req.user);
    return success(res, role, 'Role updated successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const remove = async (req, res, next) => {
  try {
    await adminRolesService.remove(req.params.id);
    return success(res, null, 'Role deleted successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const assignToUser = async (req, res, next) => {
  try {
    await adminRolesService.assignToUser(req.body.userId, req.body.roleId, req.user.id);
    return success(res, null, 'Role assigned successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const unassignFromUser = async (req, res, next) => {
  try {
    await adminRolesService.unassignFromUser(req.params.userId, req.params.roleId);
    return success(res, null, 'Role unassigned successfully');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const getUserRoles = async (req, res, next) => {
  try {
    const roles = await adminRolesService.getUserRoles(req.params.userId);
    return success(res, roles);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getUsersWithRoles = async (req, res, next) => {
  try {
    const users = await adminRolesService.getUsersWithRoles();
    return success(res, users);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
};

export const getSchema = async (req, res, next) => {
  try {
    return success(res, adminRolesService.getSchema());
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ── Admin account management ────────────────────────────────────────────

export const getAccounts = async (req, res, next) => {
  try {
    const groups = await adminRolesService.getAccountsGroupedByRole();
    return success(res, groups);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

export const createAccount = async (req, res, next) => {
  try {
    const account = await adminRolesService.createAdminAccount(req.body, req.user.id);
    return created(res, account, 'Admin account created');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    await adminRolesService.deleteAdminAccount(req.params.userId);
    return success(res, null, 'Admin account deleted');
  } catch (err) {
    return error(res, err.message, err.statusCode || 400);
  }
};
