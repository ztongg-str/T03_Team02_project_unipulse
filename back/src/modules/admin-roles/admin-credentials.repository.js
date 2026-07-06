import pool from '../../config/database.js';

export const findAllGroupedByRole = async () => {
  const [rows] = await pool.query(
    `SELECT ar.id as roleId, ar.name as roleName, ar.description,
            u.id as userId, u.fullName, u.username,
            COALESCE(ac.email, u.email) as email,
            ac.password_encrypted
     FROM admin_roles ar
     JOIN user_admin_roles uar ON ar.id = uar.roleId
     JOIN users u ON uar.userId = u.id
     LEFT JOIN admin_credentials ac ON u.id = ac.userId
     ORDER BY ar.name ASC, u.fullName ASC`
  );

  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.roleId]) {
      grouped[row.roleId] = {
        roleId: row.roleId,
        roleName: row.roleName,
        description: row.description,
        accounts: [],
      };
    }
    grouped[row.roleId].accounts.push({
      userId: row.userId,
      fullName: row.fullName,
      username: row.username,
      email: row.email,
      passwordEncrypted: row.password_encrypted,
      assignedAt: row.assignedAt,
    });
  }

  return Object.values(grouped);
};

export const createCredential = async ({ userId, email, passwordEncrypted, createdBy }) => {
  await pool.query(
    'INSERT INTO admin_credentials (userId, email, password_encrypted, createdBy) VALUES (?, ?, ?, ?)',
    [userId, email, passwordEncrypted, createdBy]
  );
};

export const findByUserId = async (userId) => {
  const [rows] = await pool.query('SELECT * FROM admin_credentials WHERE userId = ?', [userId]);
  return rows[0] || null;
};

export const removeByUserId = async (userId) => {
  await pool.query('DELETE FROM admin_credentials WHERE userId = ?', [userId]);
};
