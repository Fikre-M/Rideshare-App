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
import { 
  validateImageFile, 
  fileToBase64, 
  compressImage, 
  storeImageInLocalStorage,
  getImageFromLocalStorage,
} from "../utils/imageUtils";

const TOKEN_KEY = "ai_rideshare_auth_token";
const USERS_KEY = "ai_rideshare_users";
const USER_IMAGES_KEY = "ai_rideshare_user_images";

/** Simple SHA-256 hash via Web Crypto — used only for demo credential storage */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  avatar?: string;
  totalRides?: number;
  rating?: number;
  exp?: number;
  vehicle?: string;
  licensePlate?: string;
}

interface StoredUser extends User {
  password: string;
  joinDate: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  uploadProfileImage: (imageFile: File) => Promise<string>;
  removeProfileImage: () => Promise<string>;
  getUserImage: (userId: string) => string | null;
  hasRole: (requiredRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const navigate = useNavigate();
  
  const initializeUsers = useCallback(async () => {
    try {
      const existingUsers = localStorage.getItem(USERS_KEY);
      if (!existingUsers) {
        const defaultUsers: StoredUser[] = [
          {
            id: "admin-001",
            email: "admin@airideshare.com",
            password: await hashPassword("admin123"),
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
            password: await hashPassword("user123"),
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
            password: await hashPassword("driver123"),
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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await initializeUsers();
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser) as User;
          if (userData.exp && userData.exp * 1000 > Date.now()) {
            const imageKey = `${USER_IMAGES_KEY}_${userData.id}`;
            const customImage = getImageFromLocalStorage(imageKey);
            if (customImage) userData.avatar = customImage;
            setUser(userData);
            setToken(storedToken);
          } else {
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
    async (email: string, password: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        if (!email || !password) throw new Error("Email and password are required");

        const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as StoredUser[];
        const hashedInput = await hashPassword(password);
        const foundUser = users.find(u => u.email === email && u.password === hashedInput);

        if (!foundUser) throw new Error("Invalid email or password");

        const mockToken = `ai-rideshare-token-${Date.now()}`;
        localStorage.setItem(TOKEN_KEY, mockToken);

        const userData: User = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          roles: foundUser.roles,
          avatar: foundUser.avatar,
          totalRides: foundUser.totalRides,
          rating: foundUser.rating,
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        };

        setToken(mockToken);
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        toast.success(`Welcome back, ${foundUser.name}!`);
        navigate("/dashboard");
        return true;
      } catch (error) {
        console.error("Login failed:", error);
        toast.error((error as Error).message || "Login failed. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const register = useCallback(
    async (userData: RegisterData): Promise<boolean> => {
      try {
        setIsLoading(true);
        const { email, password, name, role = "user" } = userData;

        if (!email || !password || !name) throw new Error("All fields are required");
        if (password.length < 6) throw new Error("Password must be at least 6 characters");

        const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as StoredUser[];
        if (users.find(u => u.email === email)) throw new Error("User with this email already exists");

        const newUser: StoredUser = {
          id: `${role}-${Date.now()}`,
          email,
          password: await hashPassword(password),
          name,
          roles: [role],
          avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=150&h=150&fit=crop&crop=face`,
          joinDate: new Date().toISOString().split('T')[0],
          totalRides: 0,
          rating: 5.0,
          ...(role === "driver" && { vehicle: "Not specified", licensePlate: "TBD" }),
        };

        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        const mockToken = `ai-rideshare-token-${Date.now()}`;
        localStorage.setItem(TOKEN_KEY, mockToken);

        const userSession: User = {
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
        toast.error((error as Error).message || "Registration failed. Please try again.");
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
    navigate('/login', { replace: true });
    setTimeout(() => { toast.success('Successfully logged out'); }, 100);
  }, [navigate]);

  const uploadProfileImage = useCallback(async (imageFile: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    if (!imageFile) throw new Error('No file provided');

    const validation = validateImageFile(imageFile, {
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    });

    if (!validation.isValid) throw new Error(validation.errors.join(', '));

    const compressedImage = await compressImage(imageFile, { maxSizeKB: 500, quality: 0.8 });
    const imageKey = `${USER_IMAGES_KEY}_${user.id}`;
    const stored = storeImageInLocalStorage(imageKey, compressedImage);

    if (!stored) throw new Error('Failed to store image. Image may be too large.');

    const updatedUser = { ...user, avatar: compressedImage };
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as StoredUser[];
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].avatar = compressedImage;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    toast.success('Profile image updated successfully!');
    return compressedImage;
  }, [user]);

  const removeProfileImage = useCallback(async (): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const imageKey = `${USER_IMAGES_KEY}_${user.id}`;
    localStorage.removeItem(imageKey);

    const defaultAvatar = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=150&h=150&fit=crop&crop=face`;
    const updatedUser = { ...user, avatar: defaultAvatar };

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as StoredUser[];
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].avatar = defaultAvatar;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    toast.success('Profile image removed successfully!');
    return defaultAvatar;
  }, [user]);

  const getUserImage = useCallback((userId: string): string | null => {
    if (!userId) return null;
    const imageKey = `${USER_IMAGES_KEY}_${userId}`;
    const image = getImageFromLocalStorage(imageKey);
    if (image) return image;
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as StoredUser[];
    const userData = users.find(u => u.id === userId);
    return userData?.avatar || null;
  }, []);

  const isAuthenticated = useMemo(() => {
    if (!user || !token) return false;
    if (user.exp && user.exp * 1000 < Date.now()) {
      logout();
      return false;
    }
    return true;
  }, [user, token, logout]);

  const value: AuthContextType = {
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
    hasRole: (requiredRoles: string[]) => {
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
