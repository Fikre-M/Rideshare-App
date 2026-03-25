// @ts-nocheck
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  Badge, 
  Avatar, 
  Tooltip, 
  Menu, 
  MenuItem, 
  Divider,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  LocalTaxi as LocalTaxiIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

// Constants
import { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED, HEADER_HEIGHT } from '../../utils/layout';

const Header = ({ onDrawerToggle, onToggleCollapse, isCollapsed, drawerWidth }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications] = useState([
    { id: 1, type: 'info', message: 'New ride request received', time: '5 min ago' },
    { id: 2, type: 'warning', message: 'Driver John is running late', time: '10 min ago' },
    { id: 3, type: 'info', message: 'Payment received for ride #1234', time: '1 hour ago' },
  ]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const menuId = 'primary-account-menu';
  const notificationMenuId = 'notification-menu';
  const isMenuOpen = Boolean(anchorEl);
  const isNotificationOpen = Boolean(notificationAnchor);

  const renderNotificationMenu = (
    <Menu
      anchorEl={notificationAnchor}
      id={notificationMenuId}
      open={isNotificationOpen}
      onClose={handleNotificationClose}
      PaperProps={{
        sx: { width: 320, maxHeight: 400 }
      }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="h6">Notifications</Typography>
      </Box>
      <Divider />
      <List sx={{ p: 0 }}>
        {notifications.map((notification) => (
          <ListItem key={notification.id} button onClick={handleNotificationClose}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: notification.type === 'warning' ? 'warning.main' : 'info.main' }}>
                {notification.type === 'warning' ? <WarningIcon /> : <InfoIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={notification.message}
              secondary={notification.time}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
        ))}
      </List>
      <Divider />
      <MenuItem onClick={handleNotificationClose} sx={{ justifyContent: 'center' }}>
        View All Notifications
      </MenuItem>
    </Menu>
  );

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle1" noWrap>
          {user?.name || 'User'}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {user?.email || 'user@example.com'}
        </Typography>
      </Box>
      <Divider />
      <MenuItem onClick={handleMenuClose} component={RouterLink} to="/dashboard/profile">
        <AccountIcon sx={{ mr: 1 }} /> Profile
      </MenuItem>
      <MenuItem onClick={handleMenuClose} component={RouterLink} to="/dashboard/settings">
        <SettingsIcon sx={{ mr: 1 }} /> Settings
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <LogoutIcon sx={{ mr: 1 }} /> Sign out
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: `${drawerWidth}px` },
          height: HEADER_HEIGHT,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          boxShadow: 'none',
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {/* Mobile hamburger - only show on mobile */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Car Icon - Navigate to home */}
            <Tooltip title="Home">
              <IconButton color="inherit" onClick={() => navigate('/dashboard')}>
                <LocalTaxiIcon sx={{ color: 'primary.main' }} />
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit" size="large" onClick={handleNotificationOpen}>
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Account settings">
              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                size="large"
              >
                <Avatar 
                  alt={user?.name || 'User'} 
                  src={user?.avatar} 
                  sx={{ width: 32, height: 32 }}
                >
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      {renderNotificationMenu}
      {renderMenu}
    </>
  );
};

export default Header;
