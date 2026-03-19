import { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Tooltip,
  Typography,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Map as MapIcon,
  Timeline as AnalyticsIcon,
  DirectionsCar,
  LocalShipping as DispatchIcon,
  Settings as SettingsIcon,
  LocalTaxi as LocalTaxiIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';

// Constants
import { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED, HEADER_HEIGHT } from '../../utils/layout';

const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/dashboard',
  },
  { 
    text: 'Book Ride', 
    icon: <DirectionsCar />, 
    path: '/dashboard/book',
  },
  { 
    text: 'AI Analytics', 
    icon: <AnalyticsIcon />, 
    path: '/dashboard/analytics',
  },
  { 
    text: 'AI Dispatch', 
    icon: <DispatchIcon />, 
    path: '/dashboard/dispatch',
  },
  { 
    text: 'Map View', 
    icon: <MapIcon />, 
    path: '/dashboard/map',
  },
  { 
    text: 'Settings', 
    icon: <SettingsIcon />, 
    path: '/dashboard/settings',
  },
];

const Sidebar = ({ mobileOpen, onDrawerToggle, isCollapsed }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Auto-close mobile drawer on navigation
  useEffect(() => {
    if (isMobile && mobileOpen) {
      onDrawerToggle();
    }
  }, [location.pathname]);

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo/Brand - Clickable */}
      <Box
        onClick={() => navigate('/dashboard')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          minHeight: HEADER_HEIGHT,
          borderBottom: 1,
          borderColor: 'divider',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        {(!isCollapsed || isMobile) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalTaxiIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
              AI Rideshare
            </Typography>
          </Box>
        )}
        {(isCollapsed && !isMobile) && (
          <LocalTaxiIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        )}
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding sx={{ display: 'block', px: 1 }}>
              <Tooltip
                title={isCollapsed && !isMobile ? item.text : ''}
                placement="right"
                arrow
              >
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={isActive}
                  sx={{
                    minHeight: 48,
                    justifyContent: isCollapsed && !isMobile ? 'center' : 'initial',
                    px: 2.5,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isCollapsed && !isMobile ? 'auto' : 2,
                      justifyContent: 'center',
                      color: isActive ? 'inherit' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {(!isCollapsed || isMobile) && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            bgcolor: 'background.paper',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: isCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
