// src/services/api.js
// ─────────────────────────────────────────────────────────────────────────────
// PURPOSE: Central Axios instance + typed helper functions for every API call.
//          Components never import Axios directly — they use these functions.
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';

// The Vite dev server proxies /api → http://localhost:5000, so we don't need
// to hardcode the port.  In production, set VITE_API_BASE_URL.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Auth header injection ────────────────────────────────────────────────────
// Reads the JWT from localStorage on every request so the token can be updated
// without recreating the instance.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mn_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Global response error handler ───────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401/403 anywhere (token expired), clear local auth and reload.
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('mn_token');
      localStorage.removeItem('mn_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)  => api.post('/auth/register', data),
  login:    (data)  => api.post('/auth/login',    data),
};

// ─── Notes ────────────────────────────────────────────────────────────────────
export const notesAPI = {
  getAll:  (search = '') => api.get('/notes', { params: search ? { search } : {} }),
  getById: (id)          => api.get(`/notes/${id}`),
  create:  (data)        => api.post('/notes', data),
  update:  (id, data)    => api.put(`/notes/${id}`, data),
  delete:  (id)          => api.delete(`/notes/${id}`),
};

export default api;
