import axios from 'axios';

// ─── Token helpers ───────────────────────────────────────────────────────────
const TOKEN_KEY = 'mj_access_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// ─── Axios instance ──────────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Attach Authorization header + Content-Type on every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] =
      config.headers['Content-Type'] || 'application/json';
  }
  return config;
});

// ─── Auth API calls ──────────────────────────────────────────────────────────
export const register = async (name, email, password) => {
  const response = await api.post('/api/auth/register', { name, email, password });
  if (response.data.access_token) {
    setToken(response.data.access_token);
  }
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  if (response.data.access_token) {
    setToken(response.data.access_token);
  }
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/api/auth/logout');
  clearToken();
  return response.data;
};

export const fetchMe = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};