import { api } from './authClient';

export const getStats = async () => {
  const response = await api.get('/api/analytics/stats');
  return response.data;
};
