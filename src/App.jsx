import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';

// Hooks
import { useAuth } from '@/context/AuthContext';
import { useLocalStorage } from '@/hooks';

// Styles
import { GlobalStyles, theme as lightTheme, darkTheme } from '@/styles';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Login = lazy(() => import('@/pages/auth/Login'));
const MapView = lazy(() => import('@/pages/MapView'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Dispatch = lazy(() => import('@/pages/Dispatch'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Auth Guard Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Only Route Component
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  const theme = darkMode ? darkTheme : lightTheme;

  // Add class to body for dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyles />
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            autoHideDuration={3000}
          >
            <Router>
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  {/* Public Routes */}
                  <Route element={<PublicOnlyRoute><AuthLayout /></PublicOnlyRoute>}>
                    <Route path="/login" element={<Login />} />
                  </Route>

                  {/* Protected Routes */}
                  <Route element={
                    <ProtectedRoute>
                      <MainLayout darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
                    </ProtectedRoute>
                  }>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/map" element={<MapView />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/dispatch" element={<Dispatch />} />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster position="top-right" />
              <ReactQueryDevtools initialIsOpen={false} />
            </Router>
          </SnackbarProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;