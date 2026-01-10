import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response.data;
  },
  (error) => {
    // Handle errors
    const { response } = error;
    let errorMessage = 'An unexpected error occurred';
    
    if (response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = response;
      
      if (status === 401) {
        // Unauthorized - token expired or invalid
        errorMessage = 'Your session has expired. Please log in again.';
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (status === 403) {
        // Forbidden - user doesn't have permission
        errorMessage = 'You do not have permission to perform this action';
      } else if (status === 404) {
        // Not found
        errorMessage = 'The requested resource was not found';
      } else if (status === 422) {
        // Validation error
        errorMessage = data.message || 'Validation failed';
        return Promise.reject(data);
      } else if (status >= 500) {
        // Server error
        errorMessage = 'A server error occurred. Please try again later.';
      } else if (data?.message) {
        errorMessage = data.message;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server. Please check your connection.';
    }
    
    // Show error toast
    toast.error(errorMessage);
    
    return Promise.reject(error);
  }
);

// API methods
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

export const vehicles = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  updateStatus: (id, status) => api.patch(`/vehicles/${id}/status`, { status }),
  getHistory: (id, params) => api.get(`/vehicles/${id}/history`, { params }),
};

export const trips = {
  getAll: (params) => api.get('/trips', { params }),
  getById: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  cancel: (id) => api.post(`/trips/${id}/cancel`),
  getActive: () => api.get('/trips/active'),
};

export const drivers = {
  getAll: (params) => api.get('/drivers', { params }),
  getById: (id) => api.get(`/drivers/${id}`),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  getStats: (id) => api.get(`/drivers/${id}/stats`),
};

export const analytics = {
  getKpis: () => api.get('/analytics/kpis'),
  getDemandHeatmap: (params) => api.get('/analytics/demand/heatmap', { params }),
  getTripMetrics: (params) => api.get('/analytics/trips/metrics', { params }),
  getDriverPerformance: (params) => api.get('/analytics/drivers/performance', { params }),
};

export const notifications = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const socket = {
  // This would be replaced with actual socket connection in a real implementation
  connect: () => {
    console.log('Connecting to WebSocket...');
    // In a real app, this would return a socket.io client instance
    return {
      on: (event, callback) => {
        console.log(`Listening to ${event}`);
        // Mock implementation
        if (event === 'connect') {
          setTimeout(() => callback(), 100);
        }
      },
      emit: (event, data) => {
        console.log(`Emitting ${event}:`, data);
      },
      disconnect: () => {
        console.log('Disconnected from WebSocket');
      },
    };
  },
};

export default api;
