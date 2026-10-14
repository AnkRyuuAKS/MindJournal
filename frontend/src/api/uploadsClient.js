import { api } from './authClient';

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteImage = async (filename) => {
  const response = await api.delete(`/api/uploads/${filename}`);
  return response.data;
};
