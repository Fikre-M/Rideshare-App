import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Box
        component="main"
        sx={{
          width: '100%',
          maxWidth: 450,
          p: 4,
          boxShadow: 1,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AuthLayout;
