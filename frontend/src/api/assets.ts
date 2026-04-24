import api from './axios';

export const assetsApi = {
  list: (params?: any) => api.get('/assets', { params }).then(res => res.data),
  getOne: (id: number | string) => api.get(`/assets/${id}`).then(res => res.data),
  scan: (code: string) => api.get(`/assets/scan/${code}`).then(res => res.data),
  create: (data: any) => api.post('/assets', data).then(res => res.data),
  updateLocation: (id: number | string, data: any) => api.put(`/assets/${id}/location`, data).then(res => res.data),
  updateUsage: (id: number | string, data: any) => api.put(`/assets/${id}/usage`, data).then(res => res.data),
  dispose: (id: number | string, formData: FormData) => api.put(`/assets/${id}/dispose`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
  delete: (id: number | string) => api.delete(`/assets/${id}`).then(res => res.data),
};
