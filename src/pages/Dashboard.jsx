import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PageContainer, PageHeader } from '../components/layout';
import KPICard from '../components/dashboard/KPICard';
import RealTimeMap from '../components/dashboard/RealTimeMap';
import EventFeed from '../components/dashboard/EventFeed';

// Mock API functions
const fetchDashboardData = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    totalVehicles: 247,
    activeDrivers: 189,
    tripsToday: 1245,
    avgWaitTime: 4.2,
    occupancyRate: 0.78,
    events: [
      {
        id: 1,
        type: 'vehicle',
        title: 'New vehicle added',
        message: 'New vehicle #VH-2023-045 has been added to the fleet',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        status: 'resolved',
        severity: 'low',
      },
      {
        id: 2,
        type: 'alert',
        title: 'High demand detected',
        message: 'Unusually high demand in Bole area. Consider dispatching more vehicles.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        status: 'pending',
        severity: 'high',
        location: 'Bole, Addis Ababa',
      },
      {
        id: 3,
        type: 'warning',
        title: 'Maintenance required',
        message: 'Vehicle #VH-2023-012 requires scheduled maintenance',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        status: 'pending',
        severity: 'medium',
      },
      {
        id: 4,
        type: 'vehicle',
        title: 'Driver shift started',
        message: 'Driver John D. has started their shift',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
        status: 'resolved',
        severity: 'low',
      },
    ],
  };
};

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <PageContainer>
      <PageHeader
        title="Operations Dashboard"
        subtitle="Real-time overview of your transportation operations"
      />

      {/* KPI Cards */}
      <Box mb={2}>
        <SectionTitle variant="h6">Key Performance Indicators</SectionTitle>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={1}>
            <Grid item xs={12} sm={12} md={3}>
              <motion.div variants={itemVariants}>
                <KPICard
                  title="Total Vehicles"
                  value={dashboardData?.totalVehicles || 0}
                  change={2.5}
                  loading={isLoading}
                  color="primary"
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <motion.div variants={itemVariants}>
                <KPICard
                  title="Active Drivers"
                  value={dashboardData?.activeDrivers || 0}
                  change={1.2}
                  loading={isLoading}
                  color="success"
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <motion.div variants={itemVariants}>
                <KPICard
                  title="Trips Today"
                  value={dashboardData?.tripsToday || 0}
                  change={5.8}
                  loading={isLoading}
                  color="info"
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <motion.div variants={itemVariants}>
                <KPICard
                  title="Avg. Wait Time"
                  value={`${dashboardData?.avgWaitTime || 0}m`}
                  change={-0.7}
                  loading={isLoading}
                  color="warning"
                />
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={12} md={3}>
              <motion.div variants={itemVariants}>
                <KPICard
                  title="Occupancy Rate"
                  value={`${((dashboardData?.occupancyRate || 0) * 100).toFixed(1)}%`}
                  change={1.3}
                  loading={isLoading}
                  color="secondary"
                />
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Box>

      {/* Map and Events Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <SectionTitle variant="h6">Live Vehicle Tracking</SectionTitle>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Box
              sx={{
                height: { xs: 400, md: 500 },
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <RealTimeMap height={400} />
            </Box>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <SectionTitle variant="h6">Recent Events</SectionTitle>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Paper
              sx={{
                height: { xs: 400, md: 500 },
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: theme.shadows[3],
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Latest Activities
                </Typography>
              </Box>
              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <EventFeed 
                  events={dashboardData?.events || []} 
                  loading={isLoading} 
                />
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Dashboard;
