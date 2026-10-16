import { setToken, clearToken, getToken } from '../services/token';
import { api } from '../services/axios';

export { getToken, clearToken, setToken };

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