import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.name || 'User'}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Here's what's happening with your transportation operations.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          {[
            { title: 'Total Vehicles', value: '24', change: '+12%' },
            { title: 'Active Routes', value: '15', change: '+5%' },
            { title: 'Completed Trips', value: '342', change: '+23%' },
            { title: 'On-time Delivery', value: '94%', change: '+2%' },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {stat.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600, mr: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: stat.change.startsWith('+') ? 'success.main' : 'error.main',
                        fontWeight: 500,
                      }}
                    >
                      {stat.change}
                    </Typography>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Recent Activities */}
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              <Box>
                {[
                  'Vehicle #T-2456 completed delivery to Downtown Hub',
                  'New maintenance scheduled for Vehicle #T-1892',
                  'Route optimization completed for tomorrow\'s deliveries',
                  'Driver check-in: John D. started shift at 8:00 AM',
                  'New delivery request received from Acme Corp',
                ].map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      py: 1.5,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Typography variant="body2">{activity}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date().toLocaleTimeString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Add New Vehicle', icon: '🚚' },
                  { label: 'Create New Route', icon: '🗺️' },
                  { label: 'Schedule Maintenance', icon: '🔧' },
                  { label: 'Generate Report', icon: '📊' },
                ].map((action, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Box sx={{ fontSize: '1.5rem' }}>{action.icon}</Box>
                      <Typography variant="body1">{action.label}</Typography>
                    </Paper>
                  </motion.div>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
