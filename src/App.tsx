import React, { Suspense, lazy, useState, useCallback, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider } from "notistack";
import { QueryClientProvider } from "@tanstack/react-query";
import { Fab, Tooltip, useMediaQuery } from "@mui/material";
import { Chat as ChatIcon } from "@mui/icons-material";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoadingScreen from "./components/common/LoadingScreen";
import ScrollToTop from "./components/common/ScrollToTop";
import { LazyChatBot } from "./components/ai/LazyAIComponents";
import AICostTracker from "./components/ai/AICostTracker";
import { MotionProvider } from "./components/common/OptimizedMotion";
import { CommandPalette } from "./components/modern/CommandPalette";
import ProtectedRoute from "./components/common/ProtectedRoute";
import InstallPrompt from "./components/pwa/InstallPrompt";
import UpdatePrompt from "./components/pwa/UpdatePrompt";
import { useApiKeyStore } from "./stores/apiKeyStore";
import { useThemeStore } from "./stores/themeStore";
import config from "./utils/config";
import { queryClient } from "./utils/queryClient";

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
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const buildTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: { main: "#1976d2", light: "#42a5f5", dark: "#1565c0", contrastText: "#ffffff" },
    secondary: { main: "#dc004e", light: "#ff5983", dark: "#9a0036", contrastText: "#ffffff" },
    background: {
      default: mode === 'dark' ? "#0f1117" : "#f8fafc",
      paper: mode === 'dark' ? "#1a1d27" : "#ffffff",
    },
    text: {
      primary: mode === 'dark' ? "#f1f5f9" : "#1a202c",
      secondary: mode === 'dark' ? "#94a3b8" : "#4a5568",
    },
    success: { main: "#10b981", light: "#34d399", dark: "#059669" },
    warning: { main: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
    error: { main: "#ef4444", light: "#f87171", dark: "#dc2626" },
    info: { main: "#3b82f6", light: "#60a5fa", dark: "#2563eb" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, fontSize: '3.5rem', lineHeight: 1.2, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.3, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600, fontSize: '2rem', lineHeight: 1.4 },
    h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.5 },
    h6: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.5 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12, textTransform: 'none', fontWeight: 600, padding: '10px 24px', boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', transform: 'translateY(-1px)' },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
          border: mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiTextField: {
      styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 12 } } },
    },
  },
});



const PublicRoute = ({ children }: { children: React.ReactNode }) => {
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
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const apiKeyStore = useApiKeyStore();
  void apiKeyStore; // store is used via getState() below
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Check if setup is required on first load
  useEffect(() => {
    (useApiKeyStore.getState() as { initialize: () => void }).initialize();
  }, []);

  // Show setup screen if no API keys are configured
  // Disabled: app works without API keys, user can configure later via Settings
  // if (!setupComplete && showSetupModal) {
  //   return <SetupRequired />;
  // }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      
      // Cmd/Ctrl + Shift + A for AI chatbot
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setChatOpen(prev => !prev);
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else if (chatOpen) {
          setChatOpen(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chatOpen, commandPaletteOpen]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={
          <Suspense fallback={<LoadingScreen message="Loading..." size="medium" fullScreen={false} />}>
            <LandingPage />
          </Suspense>
        } />
        <Route path="/not-found" element={
          <Suspense fallback={<LoadingScreen message="Loading..." size="medium" fullScreen={false} />}>
            <NotFound />
          </Suspense>
        } />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingScreen message="Loading..." size="medium" fullScreen={false} />}>
                <Login />
              </Suspense>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingScreen message="Loading..." size="medium" fullScreen={false} />}>
                <Register />
              </Suspense>
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<LoadingScreen message="Loading..." size="medium" fullScreen={false} />}>
              <ForgotPassword />
            </Suspense>
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
        <Route path="*" element={
          <Suspense fallback={<LoadingScreen message="Loading..." size="medium" fullScreen={false} />}>
            <NotFound />
          </Suspense>
        } />
      </Routes>
      
      {/* AI ChatBot - Available globally on all pages */}
      <Suspense fallback={null}>
        <LazyChatBot open={chatOpen} onClose={() => setChatOpen(false)} />
      </Suspense>
      
      {/* Floating Action Button to open ChatBot */}
      {!chatOpen && (
        <Tooltip title="Open AI Assistant (Cmd/Ctrl + Shift + A)" placement="left">
          <Fab
            color="primary"
            aria-label="open ai chat"
            onClick={() => setChatOpen(true)}
            sx={{
              position: 'fixed',
              bottom: isMobile ? 16 : 24,
              right: isMobile ? 16 : 24,
              zIndex: 9998,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ChatIcon />
          </Fab>
        </Tooltip>
      )}
      
      {/* Command Palette - Cmd/Ctrl + K */}
      <CommandPalette 
        open={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)}
        onAICommand={(command) => {
          // TODO: Implement AI command routing
          // For now, just log in dev mode
          if (import.meta.env.DEV) {
            console.log('AI Command:', command);
          }
        }}
      />
      
      {/* AI Cost Tracker Widget */}
      <AICostTracker />
      
      {/* PWA Install Prompt */}
      <InstallPrompt />
      
      {/* PWA Update Prompt */}
      <UpdatePrompt />
    </>
  );
};

// AppContent has been removed as it was duplicating providers

// Global error handler for uncaught errors
const GlobalErrorHandler = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  
  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    // Log the error to your error tracking service
    console.error('Uncaught error:', error, errorInfo);
  }, []);

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

const App = () => {
  const { effectiveMode } = useThemeStore();
  const theme = React.useMemo(() => buildTheme(effectiveMode), [effectiveMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <HelmetProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <MotionProvider>
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
            </MotionProvider>
          </ThemeProvider>
        </HelmetProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
