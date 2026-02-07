import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import jwtDecode from "jwt-decode";
import { 
  validateImageFile, 
  fileToBase64, 
  compressImage, 
  storeImageInLocalStorage,
  getImageFromLocalStorage,
  isValidBase64Image 
} from "../utils/imageUtils";

const TOKEN_KEY = "ai_rideshare_auth_token";
const USERS_KEY = "ai_rideshare_users";
const USER_IMAGES_KEY = "ai_rideshare_user_images";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const navigate = useNavigate();
  
  // Initialize with some default users
  const initializeUsers = useCallback(() => {
    try {
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
    } catch (error) {
      console.error("Error initializing users:", error);
    }
  }, []);

  // Initialize users and check for existing session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await initializeUsers();
        
        // Check for existing token and user data
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          // Check if token is expired
          if (userData.exp && userData.exp * 1000 > Date.now()) {
            // Check for custom profile image
            const imageKey = `${USER_IMAGES_KEY}_${userData.id}`;
            const customImage = getImageFromLocalStorage(imageKey);
            
            if (customImage) {
              userData.avatar = customImage;
            }
            
            setUser(userData);
            setToken(storedToken);
          } else {
            // Token expired, log out
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, [initializeUsers]);

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
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours from now
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

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
    toast.success('Successfully logged out');
  }, [navigate]);

  // Upload user profile image
  const uploadProfileImage = useCallback(async (imageFile) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!imageFile) {
        throw new Error('No file provided');
      }

      // Validate image
      const validation = validateImageFile(imageFile, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      });

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Compress the image first (pass the original file)
      const compressedImage = await compressImage(imageFile, {
        maxSizeKB: 500, // Target 500KB
        quality: 0.8,
      });

      // Store image in localStorage
      const imageKey = `${USER_IMAGES_KEY}_${user.id}`;
      const stored = storeImageInLocalStorage(imageKey, compressedImage);

      if (!stored) {
        throw new Error('Failed to store image. Image may be too large.');
      }

      // Update user data with new avatar
      const updatedUser = {
        ...user,
        avatar: compressedImage,
      };

      // Update user in localStorage
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex !== -1) {
        users[userIndex].avatar = compressedImage;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }

      // Update current user state
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success('Profile image updated successfully!');
      return compressedImage;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error(error.message || 'Failed to upload profile image');
      throw error;
    }
  }, [user]);

  // Remove user profile image
  const removeProfileImage = useCallback(async () => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Remove image from localStorage
      const imageKey = `${USER_IMAGES_KEY}_${user.id}`;
      localStorage.removeItem(imageKey);

      // Set default avatar
      const defaultAvatar = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=150&h=150&fit=crop&crop=face`;

      // Update user data
      const updatedUser = {
        ...user,
        avatar: defaultAvatar,
      };

      // Update user in localStorage
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex !== -1) {
        users[userIndex].avatar = defaultAvatar;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }

      // Update current user state
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success('Profile image removed successfully!');
      return defaultAvatar;
    } catch (error) {
      console.error('Error removing profile image:', error);
      toast.error(error.message || 'Failed to remove profile image');
      throw error;
    }
  }, [user]);

  // Get user image from storage
  const getUserImage = useCallback((userId) => {
    if (!userId) return null;
    
    const imageKey = `${USER_IMAGES_KEY}_${userId}`;
    const image = getImageFromLocalStorage(imageKey);
    
    if (image) {
      return image;
    }

    // Fallback to user data
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const userData = users.find(u => u.id === userId);
    return userData?.avatar || null;
  }, []);

  // Check if user is authenticated based on token and expiration
  const isAuthenticated = useMemo(() => {
    if (!user || !token) return false;
    
    // Check if token is expired
    if (user.exp && user.exp * 1000 < Date.now()) {
      // Token expired, log out
      logout();
      return false;
    }
    
    return true;
  }, [user, token, logout]);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    token,
    login,
    register,
    logout,
    uploadProfileImage,
    removeProfileImage,
    getUserImage,
    hasRole: (requiredRoles) => {
      if (!user?.roles) return false;
      return requiredRoles.some(role => user.roles.includes(role));
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
