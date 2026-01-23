import axios from 'axios';
import { toast } from 'react-hot-toast';
import config from '../config/config';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false, // Set to true if using cookies for auth
});

/**
 * Request interceptor for API calls
 */
api.interceptors.request.use(
  (config) => {
    // Get auth token from storage
    const token = localStorage.getItem(config.auth.tokenKey);
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.headers['X-Request-Timestamp'] = new Date().toISOString();
    
    // Log request in development
    // if (import.meta.env.DEV) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    // if (import.meta.env.DEV) {
    if (process.env.NODE_ENV === "development") {
      console.error("[API] Request Error:", error);
    }
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for API calls
 */
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    // if (import.meta.env.DEV) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        },
      );
    }
    
    // Return only the data from the response
    return response.data;
  },
  (error) => {
    const { response, config } = error;
    const errorMessage = response?.data?.message || error.message || 'An error occurred';
    const status = response?.status;
    
    // Log error in development
    // if (import.meta.env.DEV) {
    if (process.env.NODE_ENV === "development") {
      console.error("[API] Response Error:", {
        url: config?.url,
        status,
        error: errorMessage,
        response: response?.data,
      });
    }
    
    // Handle specific HTTP status codes
    if (status === 401) {
      // Handle unauthorized access
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.refreshTokenKey);
      
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
      
      // Show error toast
      toast.error('Your session has expired. Please log in again.');
    } else if (status === 403) {
      // Handle forbidden access
      toast.error('You do not have permission to perform this action.');
    } else if (status === 404) {
      // Handle not found
      toast.error('The requested resource was not found.');
    } else if (status === 429) {
      // Handle rate limiting
      toast.error('Too many requests. Please try again later.');
    } else if (status >= 500) {
      // Handle server errors
      toast.error('A server error occurred. Please try again later.');
    } else if (!status) {
      // Handle network errors
      toast.error('Unable to connect to the server. Please check your internet connection.');
    }
    
    // Return a consistent error object
    return Promise.reject({
      status,
      message: errorMessage,
      errors: response?.data?.errors || {},
      code: response?.data?.code || 'UNKNOWN_ERROR',
    });
  }
);

// Helper function to handle file uploads
export const uploadFile = async (file, url = '/upload', fieldName = 'file', onUploadProgress) => {
  const formData = new FormData();
  formData.append(fieldName, file);
  
  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.lengthComputable) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  });
};

// Helper function to handle token refresh
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem(config.auth.refreshTokenKey);
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    const { token, expiresIn } = response.data;
    
    // Store the new token and expiration
    localStorage.setItem(config.auth.tokenKey, token);
    if (expiresIn) {
      const expiryTime = new Date().getTime() + expiresIn * 1000;
      localStorage.setItem(config.auth.tokenExpiryKey, expiryTime.toString());
    }
    
    return token;
  } catch (error) {
    // If refresh fails, clear auth data and redirect to login
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
    localStorage.removeItem(config.auth.tokenExpiryKey);
    
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    
    throw error;
  }
};

// Add a request interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshToken();
        
        // Update the Authorization header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth and redirect to login
        localStorage.removeItem(config.auth.tokenKey);
        localStorage.removeItem(config.auth.refreshTokenKey);
        localStorage.removeItem(config.auth.tokenExpiryKey);
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
