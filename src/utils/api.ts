import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import config from '../utils/config';

const api: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false,
});

// ── Request interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(config.auth.tokenKey);
    if (token) reqConfig.headers.Authorization = `Bearer ${token}`;
    reqConfig.headers['X-Request-Timestamp'] = new Date().toISOString();
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${reqConfig.method?.toUpperCase()} ${reqConfig.url}`, { params: reqConfig.params, data: reqConfig.data });
    }
    return reqConfig;
  },
  (error: unknown) => {
    if (process.env.NODE_ENV === 'development') console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// ── Response interceptor (single, combined) ───────────────────────────────
// Handles: success unwrapping, error toasts, 401 token refresh, redirect
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url}`, { status: response.status, data: response.data });
    }
    // Unwrap .data so callers receive the payload directly
    return response.data;
  },
  async (error: any) => {
    const originalRequest = error.config;
    const { response, config: errConfig } = error;
    const status: number | undefined = response?.status;
    const errorMessage = response?.data?.message || error.message || 'An error occurred';

    if (process.env.NODE_ENV === 'development') {
      console.error('[API] Response Error:', { url: errConfig?.url, status, error: errorMessage, response: response?.data });
    }

    // ── Token refresh on first 401 ────────────────────────────────────────
    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        // refresh failed — fall through to redirect below
      }
    }

    // ── Status-based toasts & redirects ──────────────────────────────────
    if (status === 401) {
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.refreshTokenKey);
      if (!window.location.pathname.includes('/login')) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
      toast.error('Your session has expired. Please log in again.');
    } else if (status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (status === 404) {
      toast.error('The requested resource was not found.');
    } else if (status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (status !== undefined && status >= 500) {
      toast.error('A server error occurred. Please try again later.');
    } else if (!status) {
      toast.error('Unable to connect to the server. Please check your internet connection.');
    }

    return Promise.reject({ status, message: errorMessage, errors: response?.data?.errors ?? {}, code: response?.data?.code ?? 'UNKNOWN_ERROR' });
  }
);

// ── Helpers ───────────────────────────────────────────────────────────────

export const uploadFile = async (
  file: File,
  url = '/upload',
  fieldName = 'file',
  onUploadProgress?: (percent: number) => void
): Promise<unknown> => {
  const formData = new FormData();
  formData.append(fieldName, file);
  return api.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onUploadProgress && e.lengthComputable && e.total) {
        onUploadProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
};

export const refreshToken = async (): Promise<string> => {
  const storedRefreshToken = localStorage.getItem(config.auth.refreshTokenKey);
  if (!storedRefreshToken) throw new Error('No refresh token available');

  try {
    // Use a raw axios call (not the intercepted instance) to avoid infinite loops
    const response = await axios.post(`${config.api.baseUrl}/auth/refresh-token`, { refreshToken: storedRefreshToken });
    const { token, expiresIn } = response.data as { token: string; expiresIn?: number };
    localStorage.setItem(config.auth.tokenKey, token);
    if (expiresIn) {
      localStorage.setItem(config.auth.tokenExpiryKey, String(Date.now() + expiresIn * 1000));
    }
    return token;
  } catch (error) {
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
    localStorage.removeItem(config.auth.tokenExpiryKey);
    if (!window.location.pathname.includes('/login')) window.location.href = '/login';
    throw error;
  }
};

export default api;
