import { Suspense, lazy, useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider } from "notistack";
import { QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoadingScreen from "./components/common/LoadingScreen";
import ScrollToTop from "./components/common/ScrollToTop";
import ChatBot, { ChatTrigger } from "./components/ai/ChatBot";
import ProtectedRoute from "./components/common/ProtectedRoute";
import config from "./config/config";
import { queryClient } from "./lib/queryClient";

// Initialize error tracking (e.g., Sentry)
if (config.analytics.sentryDsn) {
  // Initialize your error tracking service here
  // Example with Sentry:
  // import * as Sentry from "@sentry/react";
  // Sentry.init({ dsn: config.analytics.sentryDsn });
}

// Lazy load components
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { 
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
      contrastText: "#ffffff"
    },
    secondary: { 
      main: "#dc004e",
      light: "#ff5983",
      dark: "#9a0036",
      contrastText: "#ffffff"
    },
    background: { 
      default: "#f8fafc",
      paper: "#ffffff"
    },
    text: {
      primary: "#1a202c",
      secondary: "#4a5568"
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669"
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706"
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626"
    },
    info: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb"
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { 
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em'
    },
    h2: { 
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em'
    },
    h3: { 
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.4
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6
    },
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 12
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)',
    '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 18px rgba(0, 0, 0, 0.08)'
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});



const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/not-found" element={<NotFound />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      
      {/* AI ChatBot - Available globally on all pages */}
      <ChatTrigger onClick={() => setChatOpen(true)} />
      <ChatBot open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};

// AppContent has been removed as it was duplicating providers

// Global error handler for uncaught errors
const GlobalErrorHandler = ({ children }) => {
  const theme = useTheme();
  
  const handleError = useCallback((error, errorInfo) => {
    // Log the error to your error tracking service
    console.error('Uncaught error:', error, errorInfo);
    
    // You can also show a toast notification
    // toast.error('An unexpected error occurred. Please try again.');
  }, []);

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <HelmetProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider 
              maxSnack={3}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              autoHideDuration={5000}
              preventDuplicate
            >
              <GlobalErrorHandler>
                <AuthProvider>
                  <Suspense fallback={<LoadingScreen />}>
                    <AppRoutes />
                  </Suspense>
                  
                  <Toaster position="top-right" />
                </AuthProvider>
              </GlobalErrorHandler>
            </SnackbarProvider>
          </ThemeProvider>
        </HelmetProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
