import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';

// Components
import Header from './Header';
import Sidebar from './Sidebar';

// Constants
import { DRAWER_WIDTH, DRAWER_WIDTH_COLLAPSED, HEADER_HEIGHT } from '../../utils/layout';

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const drawerWidth = isCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <Header 
        onDrawerToggle={handleDrawerToggle} 
        onToggleCollapse={toggleCollapse}
        isCollapsed={isCollapsed}
        drawerWidth={drawerWidth}
      />
      
      {/* Sidebar */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        onDrawerToggle={handleDrawerToggle}
        isCollapsed={isCollapsed}
      />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: '100%',
            md: `calc(100% - ${drawerWidth}px)`
          },
          ml: {
            xs: 0,
            md: `${drawerWidth}px`
          },
          minHeight: '100vh',
          bgcolor: 'background.default',
          pt: `${HEADER_HEIGHT}px`,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
