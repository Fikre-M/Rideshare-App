import axios from 'axios';
// import { toast } from 'react-hot-toast';
import { useNotification } from "../hooks";

const getEnvVariable = (key, defaultValue) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // if (typeof import !== 'undefined' && import.meta && import.meta.env) {
  //   return import.meta.env[key];
  // }
  if (process.env[key]) {
    return process.env[key];
  }

  return defaultValue;
};

const api = axios.create({
  baseURL: getEnvVariable('VITE_API_URL', 'http://localhost:8000/api'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
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

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const { response } = error;
    let errorMessage = 'An unexpected error occurred';
    
    if (response) {
      const { status, data } = response;
      
      if (status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (status === 403) {
        errorMessage = 'You do not have permission to perform this action';
      } else if (status === 404) {
        errorMessage = 'The requested resource was not found';
      } else if (status === 422) {
        errorMessage = data.message || 'Validation failed';
        return Promise.reject(data);
      } else if (status >= 500) {
        errorMessage = 'A server error occurred. Please try again later.';
      } else if (data?.message) {
        errorMessage = data.message;
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your connection.';
    }
    
    toast.error(errorMessage);
    
    return Promise.reject(error);
  }
);

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
  connect: () => {
    console.log('Connecting to WebSocket...');
    return {
      on: (event, callback) => {
        console.log(`Listening to ${event}`);
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