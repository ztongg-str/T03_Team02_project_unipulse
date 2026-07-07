import axios from "axios";

// const API_BASE_URL = "http://localhost:4000/api";

const API_BASE_URL = "http://192.168.2.2:4000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  switchRole: () => api.post("/auth/switch-role").then((r) => r.data),
  forgotPassword: (email) => api.post("/auth/otp/forgot-password", { email }).then((r) => r.data),
  resetPassword: (email, otp, password) => api.post("/auth/otp/reset-password", { email, otp, password }).then((r) => r.data),
  resendOtp: (email) => api.post("/auth/otp/resend", { email }).then((r) => r.data),
};

export const usersAPI = {
  getProfile: () => api.get("/users/profile").then((r) => r.data),
  updateProfile: (data) => api.put("/users/profile", data).then((r) => r.data),
  getUserById: (id) => api.get(`/users/${id}`).then((r) => r.data),
};

export const uploadAPI = {
  file: (formData) =>
    api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),
};

export const eventsAPI = {
  getAll: (params) => api.get("/events", { params }).then((r) => r.data),
  getUpcoming: (params) => api.get("/events/upcoming", { params }).then((r) => r.data),
  getMy: (params) => api.get("/events/my", { params }).then((r) => r.data),
  getById: (id) => api.get(`/events/${id}`).then((r) => r.data),
  create: (data) => api.post("/events", data).then((r) => r.data),
  saveDraft: (data) => api.post("/events/draft", data).then((r) => r.data),
  publish: (id) => api.patch(`/events/${id}/publish`).then((r) => r.data),
  update: (id, data) => api.put(`/events/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/events/${id}`).then((r) => r.data),
};

export const registrationsAPI = {
  register: (eventId) => api.post("/registrations", { eventId }).then((r) => r.data),
  check: (eventId) => api.get(`/registrations/check/${eventId}`).then((r) => r.data),
  getMy: () => api.get("/registrations/my").then((r) => r.data),
};

export const friendsAPI = {
  getMy: () => api.get("/friends").then((r) => r.data),
  discover: () => api.get("/friends/discover").then((r) => r.data),
  search: (q) => api.get("/friends/search", { params: { q } }).then((r) => r.data),
  add: (userId) => api.post(`/friends/add/${userId}`).then((r) => r.data),
  remove: (id) => api.delete(`/friends/${id}`).then((r) => r.data),
  getProfile: (userId) => api.get(`/friends/profile/${userId}`).then((r) => r.data),
  getPending: () => api.get("/friends/requests").then((r) => r.data),
  getSent: () => api.get("/friends/requests/sent").then((r) => r.data),
  acceptRequest: (id) => api.post(`/friends/requests/${id}/accept`).then((r) => r.data),
  declineRequest: (id) => api.post(`/friends/requests/${id}/decline`).then((r) => r.data),
  cancelRequest: (id) => api.post(`/friends/requests/${id}/cancel`).then((r) => r.data),
};

export const achievementsAPI = {
  getMy: () => api.get("/achievements").then((r) => r.data),
  getByUserId: (userId) => api.get(`/achievements/user/${userId}`).then((r) => r.data),
  getAllWithStatus: () => api.get("/achievements/status").then((r) => r.data),
};

export const activityLogsAPI = {
  getMy: () => api.get("/activity-logs").then((r) => r.data),
};

export const historyAPI = {
  getUpcoming: () => api.get("/history/upcoming").then((r) => r.data),
  getPast: () => api.get("/history/past").then((r) => r.data),
};

export const savedEventsAPI = {
  getAll: () => api.get("/saved-events").then((r) => r.data),
  save: (eventId) => api.post("/saved-events", { eventId }).then((r) => r.data),
  unsave: (eventId) => api.delete(`/saved-events/${eventId}`).then((r) => r.data),
  check: (eventId) => api.get(`/saved-events/check/${eventId}`).then((r) => r.data),
};

export default api;

export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard").then((r) => r.data),
  getSystemHealth: () => api.get("/admin/system-health").then((r) => r.data),
  getLogs: (params) => api.get("/admin/logs", { params }).then((r) => r.data),
};

export const adminUsersAPI = {
  getAll: (params) => api.get("/users", { params }).then((r) => r.data),
  create: (data) => api.post("/users", data).then((r) => r.data),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }).then((r) => r.data),
  delete: (id) => api.delete(`/users/${id}`).then((r) => r.data),
};

export const adminEventsAPI = {
  getAll: (params) => api.get("/events", { params }).then((r) => r.data),
  approve: (id) => api.patch(`/events/${id}/approve`).then((r) => r.data),
  reject: (id, reason) => api.patch(`/events/${id}/reject`, { reason }).then((r) => r.data),
  delete: (id) => api.delete(`/events/${id}`).then((r) => r.data),
};

export const backupAPI = {
  listTables: () => api.get("/backup/tables").then((r) => r.data),
  previewRows: (table, ids) => api.get(`/backup/tables/${table}/preview`, { params: { ids: ids.join(",") } }).then((r) => r.data),
  createFull: () => api.post("/backup/full").then((r) => r.data),
  createTables: (tables) => api.post("/backup/tables", { tables }).then((r) => r.data),
  createRows: (table, ids) => api.post("/backup/rows", { table, ids }).then((r) => r.data),
  restore: (filename) => api.post("/backup/restore", { filename }).then((r) => r.data),
  getAll: (params) => api.get("/backup", { params }).then((r) => r.data),
  download: (filename) => `${API_BASE_URL}/backup/${filename}/download`,
  delete: (filename) => api.delete(`/backup/${filename}`).then((r) => r.data),
};

export const queryConsoleAPI = {
  execute: (query) => api.post('/query-console/execute', { query }).then((r) => r.data),
  getLogs: (params) => api.get('/query-console/logs', { params }).then((r) => r.data),
};

export const attendanceAPI = {
  checkIn: (eventId) => api.post('/attendance/checkin', { eventId }).then((r) => r.data),
  checkInByCode: (code) => api.post('/attendance/checkin-by-code', { code }).then((r) => r.data),
  getMyHistory: () => api.get('/attendance/my-history').then((r) => r.data),
};

export const adminRolesAPI = {
  getAll: () => api.get('/admin-roles').then((r) => r.data),
  getById: (id) => api.get(`/admin-roles/${id}`).then((r) => r.data),
  getSchema: () => api.get('/admin-roles/schema').then((r) => r.data),
  getUsersWithRoles: () => api.get('/admin-roles/users').then((r) => r.data),
  getUserRoles: (userId) => api.get(`/admin-roles/user/${userId}`).then((r) => r.data),
  create: (data) => api.post('/admin-roles', data).then((r) => r.data),
  update: (id, data) => api.put(`/admin-roles/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/admin-roles/${id}`).then((r) => r.data),
  assign: (userId, roleId) => api.post('/admin-roles/assign', { userId, roleId }).then((r) => r.data),
  unassign: (userId, roleId) => api.delete(`/admin-roles/unassign/${userId}/${roleId}`).then((r) => r.data),
  getAccounts: () => api.get('/admin-roles/accounts').then((r) => r.data),
  createAccount: (data) => api.post('/admin-roles/accounts', data).then((r) => r.data),
  deleteAccount: (userId) => api.delete(`/admin-roles/accounts/${userId}`).then((r) => r.data),
};
