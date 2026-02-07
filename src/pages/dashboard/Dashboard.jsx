import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom";
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  LocalShipping as DispatchIcon,
  Map as MapIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  SmartToy as AIIcon,
  DirectionsCar,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from '../../components/common/LoadingScreen';
import NotificationCenter from '../../components/notifications/NotificationCenter';
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";


// Lazy load pages
const DashboardHome = lazy(() => import('../Dashboard'));
const BookRide = lazy(() => import('../../components/booking/RideBooking'));
const Analytics = lazy(() => import('../Analytics'));
const Dispatch = lazy(() => import('../Dispatch'));
const MapView = lazy(() => import('../MapView'));
const Profile = lazy(() => import('../Profile'));

const drawerWidth = 240;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Book Ride', icon: <DirectionsCar />, path: '/dashboard/book' },
    { text: 'AI Analytics', icon: <AnalyticsIcon />, path: '/dashboard/analytics' },
    { text: 'AI Dispatch', icon: <DispatchIcon />, path: '/dashboard/dispatch' },
    { text: 'Map View', icon: <MapIcon />, path: '/dashboard/map' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(path);
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            cursor: "pointer",
          }}
          onClick={() => navigate("/dashboard")}
        >
          <LocalTaxiIcon sx={{ color: "primary.main", mr: 2 }} />
          <Typography variant="h6" noWrap>
            AI Rideshare
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={isActive(item.path)}
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "primary.contrastText",
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: "background.paper",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: "background.paper",
              borderRight: "1px solid",
              borderColor: "divider",
              position: 'relative',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          minHeight: "100vh",
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* App Bar */}
        <AppBar
          position="sticky"
          sx={{
            width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
            bgcolor: "background.paper",
            color: "text.primary",
            boxShadow: 1,
            zIndex: theme.zIndex.appBar - 1,
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              AI Rideshare Platform
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <NotificationCenter />
              {/* <AIIcon sx={{ mr: 1, color: 'primary.main' }} /> */}
              <LocalTaxiIcon sx={{ color: "primary.main", mr: 2 }} />
              <Typography variant="body2" sx={{ mr: 2 }}>
                AI-Powered
              </Typography>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                  {user?.name?.charAt(0) || "U"}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem
                  onClick={handleClose}
                  component={Link}
                  to="/dashboard/profile"
                >
                  <AccountIcon sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ flexGrow: 1, p: 0 }}>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/book" element={<BookRide />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/dispatch" element={<Dispatch />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
