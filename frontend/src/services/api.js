import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('inframind_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('inframind_token');
      sessionStorage.removeItem('inframind_user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/me');
    return res.data;
  },
};

export const assetsApi = {
  list: async () => {
    const res = await api.get('/assets');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/assets/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/assets', data);
    return res.data;
  },
  assignEngineer: async (assetId, engineerId) => {
    const res = await api.patch(`/assets/${assetId}/assignment?engineerId=${engineerId}`);
    return res.data;
  },
  seedDefaults: async () => {
    const res = await api.post('/assets/seed-defaults');
    return res.data;
  },
};

export const workApi = {
  list: async () => {
    const res = await api.get('/work-items');
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/work-items', data);
    return res.data;
  },
  transition: async (id, data) => {
    const res = await api.patch(`/work-items/${id}`, data);
    return res.data;
  },
};

export const predictionsApi = {
  list: async () => {
    const res = await api.get('/predictions');
    return res.data;
  },
  runBridgeRisk: async (assetId, features) => {
    const res = await api.post(`/predictions/bridge/${assetId}`, features);
    return res.data;
  },
  runDisplacementAnomaly: async (assetId, data) => {
    const res = await api.post(`/predictions/displacement/${assetId}`, data);
    return res.data;
  },
  runDisplacement: async (assetId, data) => {
    const res = await api.post(`/predictions/displacement/${assetId}`, data);
    return res.data;
  },
  runRoadDamage: async (formData) => {
    const res = await api.post('/predictions/road-damage', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  runStructuralDefect: async (formData) => {
    const res = await api.post('/predictions/structural-defect', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export const adminApi = {
  listUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  provisionUser: async (data) => {
    const res = await api.post('/admin/users', data);
    return res.data;
  },
  toggleUserStatus: async (id) => {
    const res = await api.patch(`/admin/users/${id}/toggle-status`);
    return res.data;
  },
  listEngineers: async () => {
    const res = await api.get('/users/engineers');
    return res.data;
  },
  listMaintenanceTeams: async () => {
    const res = await api.get('/users/maintenance-teams');
    return res.data;
  },
};

export const weatherApi = {
  getWeather: async (lat, lng) => {
    const res = await api.get(`/public/weather?latitude=${lat}&longitude=${lng}`);
    return res.data;
  },
};

export const notificationApi = {
  list: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await api.post('/notifications/mark-all-read');
    return res.data;
  },
};

export default api;
