import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";

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
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
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
  getById: (id) => api.get(`/events/${id}`).then((r) => r.data),
  create: (data) => api.post("/events", data).then((r) => r.data),
  update: (id, data) => api.put(`/events/${id}`, data).then((r) => r.data),
};

export const registrationsAPI = {
  register: (eventId) => api.post("/registrations", { eventId }).then((r) => r.data),
  cancel: (id) => api.delete(`/registrations/${id}`).then((r) => r.data),
  getMy: () => api.get("/registrations/my").then((r) => r.data),
};

export const friendsAPI = {
  getMy: () => api.get("/friends").then((r) => r.data),
  search: (q) => api.get("/friends/search", { params: { q } }).then((r) => r.data),
  add: (userId) => api.post(`/friends/add/${userId}`).then((r) => r.data),
  remove: (id) => api.delete(`/friends/${id}`).then((r) => r.data),
  getProfile: (userId) => api.get(`/friends/profile/${userId}`).then((r) => r.data),
};

export const achievementsAPI = {
  getMy: () => api.get("/achievements").then((r) => r.data),
  getAllWithStatus: () => api.get("/achievements/status").then((r) => r.data),
};

export const streaksAPI = {
  getMy: () => api.get("/streaks").then((r) => r.data),
};

export const activityLogsAPI = {
  getMy: () => api.get("/activity-logs").then((r) => r.data),
};

export const historyAPI = {
  getUpcoming: () => api.get("/history/upcoming").then((r) => r.data),
  getPast: () => api.get("/history/past").then((r) => r.data),
  moveExpired: () => api.post("/history/move-expired").then((r) => r.data),
};

export const savedEventsAPI = {
  getAll: () => api.get("/saved-events").then((r) => r.data),
  save: (eventId) => api.post("/saved-events", { eventId }).then((r) => r.data),
  unsave: (eventId) => api.delete(`/saved-events/${eventId}`).then((r) => r.data),
  check: (eventId) => api.get(`/saved-events/check/${eventId}`).then((r) => r.data),
};

export default api;
