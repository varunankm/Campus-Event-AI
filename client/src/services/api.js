import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  registerFaculty: (data) => api.post('/api/auth/register-faculty', data),
  login: (data) => api.post('/api/auth/login', data),
}

// Events
export const eventsAPI = {
  getAll: () => api.get('/api/events'),
  getById: (id) => api.get(`/api/events/${id}`),
  getMyEvents: () => api.get('/api/events/faculty/mine'),
  getParticipants: (id) => api.get(`/api/events/${id}/participants`),
  create: (data) => api.post('/api/events', data),
  update: (id, data) => api.put(`/api/events/${id}`, data),
  delete: (id) => api.delete(`/api/events/${id}`),
}

// Registrations
export const registrationAPI = {
  register: (eventId) => api.post('/api/register', { eventId }),
  getStudentDashboard: () => api.get('/api/register/studentDashboard'),
}

// AI Chat
export const aiAPI = {
  chat: (data) => api.post('/api/ai/chat', data),
  facultyChat: (data) => api.post('/api/ai/faculty-chat', data),
  facultyAnalytics: (data) => api.post('/api/ai/faculty-analytics', data),
}

// Admin / Users
export const usersAPI = {
  getStudents: () => api.get('/api/users/students'),
  getFaculty: () => api.get('/api/users/faculty'),
  getAll: () => api.get('/api/users/all'),
}

export default api
