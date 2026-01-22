import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import jwtDecode from "jwt-decode";

const TOKEN_KEY = "ai_rideshare_auth_token";
const USERS_KEY = "ai_rideshare_users";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const navigate = useNavigate();

  // Initialize with some default users
  const initializeUsers = useCallback(() => {
    const existingUsers = localStorage.getItem(USERS_KEY);
    if (!existingUsers) {
      const defaultUsers = [
        {
          id: "admin-001",
          email: "admin@airideshare.com",
          password: "admin123",
          name: "AI Admin",
          roles: ["admin"],
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          joinDate: "2024-01-01",
          totalRides: 0,
          rating: 5.0,
        },
        {
          id: "user-001",
          email: "user@airideshare.com",
          password: "user123",
          name: "John Doe",
          roles: ["user"],
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          joinDate: "2024-02-15",
          totalRides: 47,
          rating: 4.8,
        },
        {
          id: "driver-001",
          email: "driver@airideshare.com",
          password: "driver123",
          name: "Sarah Wilson",
          roles: ["driver"],
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          joinDate: "2024-01-20",
          totalRides: 234,
          rating: 4.9,
          vehicle: "Toyota Camry 2023",
          licensePlate: "ABC-123",
        },
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
  }, []);

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

  const register = useCallback(
    async (userData) => {
      try {
        setIsLoading(true);
        const { email, password, name, role = "user" } = userData;

        if (!email || !password || !name) {
          throw new Error("All fields are required");
        }

        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }

        const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
          throw new Error("User with this email already exists");
        }

        // Create new user
        const newUser = {
          id: `${role}-${Date.now()}`,
          email,
          password,
          name,
          roles: [role],
          avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=150&h=150&fit=crop&crop=face`,
          joinDate: new Date().toISOString().split('T')[0],
          totalRides: 0,
          rating: 5.0,
          ...(role === "driver" && {
            vehicle: "Not specified",
            licensePlate: "TBD",
          }),
        };

        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Auto-login after registration
        const mockToken = `ai-rideshare-token-${Date.now()}`;
        localStorage.setItem(TOKEN_KEY, mockToken);

        const userSession = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          roles: newUser.roles,
          avatar: newUser.avatar,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        };

        setToken(mockToken);
        setUser(userSession);
        localStorage.setItem("user", JSON.stringify(userSession));

        toast.success(`Welcome to AI Rideshare, ${name}!`);
        navigate("/dashboard");
        return true;
      } catch (error) {
        console.error("Registration failed:", error);
        toast.error(error.message || "Registration failed. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const login = useCallback(
    async (email, password) => {
      try {
        setIsLoading(true);
        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
          throw new Error("Invalid email or password");
        }

        const mockToken = `ai-rideshare-token-${Date.now()}`;
        localStorage.setItem(TOKEN_KEY, mockToken);

        const userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
          avatar: user.avatar,
          totalRides: user.totalRides,
          rating: user.rating,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        };

        setToken(mockToken);
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        toast.success(`Welcome back, ${user.name}!`);
        navigate("/dashboard");
        return true;
      } catch (error) {
        console.error("Login failed:", error);
        toast.error(error.message || "Login failed. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const logout = useCallback(
    (message = "You have been logged out.") => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      toast.success(message);
      navigate("/");
    },
    [navigate]
  );

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        initializeUsers();
        
        if (token) {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.exp > Math.floor(Date.now() / 1000)) {
              setUser(userData);
            } else {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem("user");
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [token, decodeToken, initializeUsers]);

  const value = {
    isAuthenticated: !!user,
    isLoading,
    user,
    token,
    login,
    register,
    logout,
    hasRole: (requiredRoles) => {
      if (!user?.roles) return false;
      if (requiredRoles.length === 0) return true;
      return requiredRoles.some((role) => user.roles.includes(role));
    },
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
