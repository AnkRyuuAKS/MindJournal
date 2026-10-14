import { api } from './authClient';

export const getDSAQuestions = async () => {
  const res = await api.get('/api/dsa');
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
