import api from './axios';

export const locationsApi = {
  getTree: () => api.get('/locations').then(res => res.data),
  getFlat: () => api.get('/locations/flat').then(res => res.data),
  getOne: (id: number) => api.get(`/locations/${id}`).then(res => res.data),
  create: (data: any) => api.post('/locations', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/locations/${id}`, data).then(res => res.data),
  remove: (id: number) => api.delete(`/locations/${id}`).then(res => res.data),
};
