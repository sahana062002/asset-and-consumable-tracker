import api from './axios';

export const usersApi = {
  list: () => api.get('/users').then(res => res.data),
  getOne: (id: number | string) => api.get(`/users/${id}`).then(res => res.data),
  create: (data: any) => api.post('/users', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data).then(res => res.data),
  resetPassword: (id: number, data: any) => api.put(`/users/${id}/reset-password`, data).then(res => res.data),
  changePassword: (data: any) => api.post('/users/change-password', data).then(res => res.data),
  remove: (id: number) => api.delete(`/users/${id}`).then(res => res.data),
};
