import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { STORAGE_KEYS } from '@/utils/constants';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA) || 'null');
        
        if (token && userData) {
          // Optionally validate token with backend
          setUser(userData);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      setUser(user);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const hasRole = useCallback((role) => {
    if (!user?.roles) return false;
    return user.roles.includes(role);
  }, [user]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
  };
};

export default useAuth;
