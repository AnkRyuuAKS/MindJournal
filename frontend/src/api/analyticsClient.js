import { api } from '../services/axios';

export const getStats = async () => {
  const response = await api.get('/api/analytics/stats');
  return response.data;
};

export const analyzeWeek = async () => {
  const response = await api.post('/api/analytics/analyze-week');
  return response.data;
};

export const getLatestReport = async () => {
  const response = await api.get('/api/analytics/latest-report');
  return response.data;
};
