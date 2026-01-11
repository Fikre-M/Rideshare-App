// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import jwtDecode from "jwt-decode";
import { toast } from "react-hot-toast";

const TOKEN_KEY = "transportation_auth_token";
const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes

const AuthContext = createContext(null);

export const AuthProvider = ({ children, navigate }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const getEnv = (key, defaultValue = "") => {
    if (typeof process !== "undefined" && process.env && process.env[key]) {
      return process.env[key];
    }
    if (typeof window !== "undefined" && window.__ENV && window.__ENV[key]) {
      return window.__ENV[key];
    }
    return defaultValue;
  };

  const decodeToken = useCallback((token) => {
    try {
      if (!token) return null;
      const decoded = jwtDecode(token);
      return {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        roles: Array.isArray(decoded.roles) ? decoded.roles : ["user"],
        exp: decoded.exp,
      };
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }, []);

  const checkTokenExpiration = useCallback(() => {
    if (!token) return false;
    const decoded = decodeToken(token);
    if (!decoded) return false;
    return decoded.exp * 1000 > Date.now();
  }, [token, decodeToken]);

  const refreshToken = useCallback(async () => {
    try {
      // Mock refresh
      const mockToken = "new-mock-jwt-token";
      localStorage.setItem(TOKEN_KEY, mockToken);
      setToken(mockToken);
      return mockToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (token) {
          if (!checkTokenExpiration()) {
            await refreshToken();
          }
          const userData = decodeToken(token);
          if (userData) {
            setUser(userData);
          } else {
            localStorage.removeItem(TOKEN_KEY);
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up token refresh interval
    const intervalId = setInterval(() => {
      if (token) {
        refreshToken().catch(console.error);
      }
    }, TOKEN_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [token, checkTokenExpiration, refreshToken, decodeToken]);

  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      // Mock user validation - replace with actual API call in production
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Mock user data - replace with actual API call
      const mockUsers = [
        { email: 'admin@example.com', password: 'admin123', name: 'Admin User', roles: ['admin'] },
        { email: 'user@example.com', password: 'user123', name: 'Regular User', roles: ['user'] },
      ];
      
      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Create a mock JWT token with user data
      const mockToken = `mock-jwt-token-${Date.now()}`;
      localStorage.setItem(TOKEN_KEY, mockToken);
      
      // Set user data in state
      const userData = {
        id: `user-${Date.now()}`,
        email: user.email,
        name: user.name,
        roles: user.roles,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours from now
      };
      
      setToken(mockToken);
      setUser(userData);
      
      // Store user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = (message = "You have been logged out.") => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);

    if (message) {
      toast.success(message);
    }

    navigate("/login", { replace: true });
  };

  const hasRole = (requiredRoles) => {
    if (!user?.roles) return false;
    if (requiredRoles.length === 0) return true;
    return requiredRoles.some((role) => user.roles.includes(role));
  };

  const value = {
    isAuthenticated: !!user && checkTokenExpiration(),
    isLoading,
    user,
    token,
    login,
    logout,
    hasRole,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : <div>Loading authentication...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
