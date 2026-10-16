import { api } from './authClient';

export const getDSAQuestions = async (params = {}) => {
  const res = await api.get('/api/dsa', { params });
  return res.data;
};

export const getDSAQuestion = async (id) => {
  const res = await api.get(`/api/dsa/${id}`);
  return res.data;
};

export const createDSAQuestion = async (data) => {
  const res = await api.post('/api/dsa', data, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
};

export const deleteDSAQuestion = async (id) => {
  const res = await api.delete(`/api/dsa/${id}`);
  return res.data;
};

