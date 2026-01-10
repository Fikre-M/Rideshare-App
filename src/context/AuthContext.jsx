import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-hot-toast';
import { api } from '@/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Initialize auth state from token
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUser(decoded);
          
          // Set auth header for all requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Validate token with backend
          await api.get('/auth/me');
        } catch (error) {
          console.error('Invalid or expired token:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = data;
      
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(userData);
      
      toast.success('Logged in successfully');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    queryClient.clear();
    navigate('/login');
  }, [navigate, queryClient]);

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isOperator = user?.role === 'operator' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        isOperator,
        login,
        logout,
        updateUser,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
