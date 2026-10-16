import axios from 'axios';
import { getToken } from '../services/token';


export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// to attach auth header for every request-> eases our work
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