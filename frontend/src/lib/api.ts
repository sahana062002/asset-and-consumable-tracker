import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api',
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Trigger full redirect out of React scope if catastrophic, but store handles typically.
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: any) => api.post('/auth/login', data).then(res => res.data),
  logout: () => api.post('/auth/logout').then(res => res.data),
  getMe: () => api.get('/auth/me').then(res => res.data),
};

export const usersApi = {
  list: () => api.get('/users').then(res => res.data),
  create: (data: any) => api.post('/users', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data).then(res => res.data),
  resetPassword: (id: number, data: any) => api.put(`/users/${id}/reset-password`, data).then(res => res.data),
  changePassword: (data: any) => api.post('/users/change-password', data).then(res => res.data),
  remove: (id: number) => api.delete(`/users/${id}`).then(res => res.data),
};


export const locationsApi = {
  getTree: () => api.get('/locations').then(res => res.data),
  getFlat: () => api.get('/locations/flat').then(res => res.data),
  getOne: (id: number) => api.get(`/locations/${id}`).then(res => res.data),
  create: (data: any) => api.post('/locations', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/locations/${id}`, data).then(res => res.data),
  remove: (id: number) => api.delete(`/locations/${id}`).then(res => res.data),
};

export const assetsApi = {
  list: (params?: any) => api.get('/assets', { params }).then(res => res.data),
  getOne: (id: number) => api.get(`/assets/${id}`).then(res => res.data),
  scan: (code: string) => api.get(`/assets/scan/${code}`).then(res => res.data),
  create: (data: any) => api.post('/assets', data).then(res => res.data),
  updateLocation: (id: number, data: any) => api.put(`/assets/${id}/location`, data).then(res => res.data),
  updateUsage: (id: number, data: any) => api.put(`/assets/${id}/usage`, data).then(res => res.data),
  dispose: (id: number, formData: FormData) => api.put(`/assets/${id}/dispose`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
  delete: (id: number) => api.delete(`/assets/${id}`).then(res => res.data),
};
