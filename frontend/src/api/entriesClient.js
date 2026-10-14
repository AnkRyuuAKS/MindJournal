import { api } from './authClient';

export const getEntries = async (params = {}) => {
  const response = await api.get('/api/entries', { params });
  return response.data;
};

export const getEntry = async (id) => {
  const response = await api.get(`/api/entries/${id}`);
  return response.data;
};

export const createEntry = async (data) => {
  const response = await api.post('/api/entries', data, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const updateEntry = async (id, data) => {
  const response = await api.put(`/api/entries/${id}`, data, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const deleteEntry = async (id) => {
  const response = await api.delete(`/api/entries/${id}`);
  return response.data;
};

export const toggleFavorite = async (id) => {
  const response = await api.patch(`/api/entries/${id}/favorite`);
  return response.data;
};
