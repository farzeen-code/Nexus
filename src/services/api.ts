import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string; role: string }) =>
    api.post('/auth/login', data),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
  
  updateProfile: (data: any) =>
    api.put('/auth/profile', data),
  
  logout: () =>
    api.post('/auth/logout'),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
};

// User APIs
export const userAPI = {
  getAllEntrepreneurs: () =>
    api.get('/users/entrepreneurs'),
  
  getAllInvestors: () =>
    api.get('/users/investors'),
  
  getUserById: (id: string) =>
    api.get(`/users/${id}`),
  
  searchUsers: (query: string, role?: string) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (role) params.append('role', role);
    return api.get(`/users/search?${params.toString()}`);
  }
};

export default api;