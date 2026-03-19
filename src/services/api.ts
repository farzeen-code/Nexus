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
export const meetingAPI = {
  createMeeting: (data: {
    requestedTo: string;
    title: string;
    description?: string;
    scheduledDate: string;
    duration?: number;
    meetingType?: 'video' | 'phone' | 'in-person';
    location?: string;
  }) => api.post('/meetings', data),
  
  getUserMeetings: (params?: { status?: string; type?: string }) =>
    api.get('/meetings', { params }),
  
  getMeetingById: (id: string) =>
    api.get(`/meetings/${id}`),
  
  updateMeetingStatus: (id: string, status: 'accepted' | 'rejected' | 'cancelled', notes?: string) =>
    api.put(`/meetings/${id}/status`, { status, notes }),
  
  updateMeeting: (id: string, data: any) =>
    api.put(`/meetings/${id}`, data),
  
  deleteMeeting: (id: string) =>
    api.delete(`/meetings/${id}`)
};
export const messageAPI = {
  sendMessage: (data: {
    receiver: string;
    content: string;
    messageType?: 'text' | 'file' | 'image';
  }) => api.post('/messages', data),
  
  getConversation: (userId: string) =>
    api.get(`/messages/${userId}`),
  
  getConversations: () =>
    api.get('/messages/conversations'),
  
  markAsRead: (messageId: string) =>
    api.put(`/messages/${messageId}/read`),
  
  getUnreadCount: () =>
    api.get('/messages/unread-count')
};

export const collaborationAPI = {
  createRequest: (data: {
    investor: string;
    title: string;
    description: string;
    requestedAmount: string;
    equity?: string;
    message?: string;
  }) => api.post('/collaborations', data),
  
  getRequests: (params?: { type?: 'sent' | 'received'; status?: string }) =>
    api.get('/collaborations', { params }),
  
  getRequestById: (id: string) =>
    api.get(`/collaborations/${id}`),
  
  updateStatus: (id: string, status: 'accepted' | 'rejected' | 'under_review', message?: string) =>
    api.put(`/collaborations/${id}/status`, { status, message }),
  
  deleteRequest: (id: string) =>
    api.delete(`/collaborations/${id}`)
};



export default api;