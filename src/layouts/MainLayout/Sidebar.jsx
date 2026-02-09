import { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Collapse,
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
  LocalShipping as FleetIcon,
  People as DriversIcon,
  Timeline as AnalyticsIcon,
  Notifications as AlertsIcon,
  Settings as SettingsIcon,
  DirectionsCar,
  LocalShipping as DispatchIcon,
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Constants
import { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED } from '../../constants/layout';

const drawerWidth = DRAWER_WIDTH;

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: open ? drawerWidth : DRAWER_WIDTH_COLLAPSED,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  '& .MuiDrawer-paper': {
    width: open ? drawerWidth : DRAWER_WIDTH_COLLAPSED,
    boxSizing: 'border-box',
    borderRight: 'none',
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
  },
  '& .MuiListItemIcon-root': {
    minWidth: 0,
    mr: open ? 2 : 'auto',
    justifyContent: 'center',
  },
  '& .MuiListItemText-root': {
    opacity: open ? 1 : 0,
    transition: theme.transitions.create('opacity', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

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
];

const Sidebar = ({ mobileOpen, onDrawerToggle, isCollapsed }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openItems, setOpenItems] = useState({});

  // Toggle submenu
  const handleClick = (text) => {
    setOpenItems(prev => ({
      ...prev,
      [text]: !prev[text]
    }));
  };

  // Close mobile drawer when route changes
  useEffect(() => {
    if (isMobile) {
      onDrawerToggle();
    }
  }, [location.pathname, isMobile, onDrawerToggle]);

  // Set initial open state for submenus
  useEffect(() => {
    const initialOpenState = {};
    menuItems.forEach(item => {
      if (item.items) {
        initialOpenState[item.text] = location.pathname.startsWith(item.path);
      }
    });
    setOpenItems(initialOpenState);
  }, [location.pathname]);

  const drawerContent = (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          minHeight: 64,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {!isCollapsed && (
          <Typography variant="h6" noWrap component="div">
            TransOps
          </Typography>
        )}
        <IconButton onClick={onDrawerToggle} size="small">
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item) => (
          <div key={item.text}>
            <ListItem 
              disablePadding 
              sx={{ display: 'block' }}
              onClick={() => item.items && handleClick(item.text)}
            >
              <Tooltip title={isCollapsed ? item.text : ''} placement="right">
                <ListItemButton
                  component={!item.items ? RouterLink : 'div'}
                  to={!item.items ? item.path : undefined}
                  selected={location.pathname === item.path}
                  sx={{
                    minHeight: 48,
                    justifyContent: isCollapsed ? 'center' : 'initial',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isCollapsed ? 'auto' : 2,
                      justifyContent: 'center',
                      color: location.pathname === item.path ? 'primary.main' : 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      noWrap: true,
                      color: location.pathname === item.path ? 'primary' : 'inherit',
                      fontWeight: location.pathname === item.path ? 'medium' : 'regular',
                    }}
                  />
                  {item.items && (openItems[item.text] ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </Tooltip>
            </ListItem>
            
            {item.items && (
              <Collapse in={openItems[item.text]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.items.map((subItem) => (
                    <ListItemButton
                      key={subItem.text}
                      component={RouterLink}
                      to={subItem.path}
                      selected={location.pathname === subItem.path}
                      sx={{
                        pl: isCollapsed ? 2 : 8,
                        '&.Mui-selected': {
                          backgroundColor: 'action.selected',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        },
                      }}
                    >
                      <ListItemText 
                        primary={subItem.text}
                        primaryTypographyProps={{
                          variant: 'body2',
                          noWrap: true,
                          color: location.pathname === subItem.path ? 'primary' : 'text.secondary',
                          fontWeight: location.pathname === subItem.path ? 'medium' : 'regular',
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </div>
        ))}
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: isCollapsed ? DRAWER_WIDTH_COLLAPSED : drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: 'background.paper',
            borderRight: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop Drawer */}
      <StyledDrawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box',
            borderRight: 'none',
          },
        }}
        open={!isCollapsed}
      >
        {drawerContent}
      </StyledDrawer>
    </Box>
  );
};

export default Sidebar;
