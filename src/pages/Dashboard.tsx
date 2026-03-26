import { Box, Typography, Paper, Grid, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { m, Variants } from 'framer-motion';
import { PageContainer, PageHeader } from '../components/layout';
import KPICard from '../components/dashboard/KPICard';
import RealTimeMap from '../components/dashboard/RealTimeMap';
import EventFeed from '../components/dashboard/EventFeed';
import type { DashboardEvent } from '../components/dashboard/EventFeed';

interface DashboardData {
  totalVehicles: number;
  activeDrivers: number;
  tripsToday: number;
  avgWaitTime: number;
  occupancyRate: number;
  events: DashboardEvent[];
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    totalVehicles: 247,
    activeDrivers: 189,
    tripsToday: 1245,
    avgWaitTime: 4.2,
    occupancyRate: 0.78,
    events: [
      { id: 1, type: 'vehicle', title: 'New vehicle added', message: 'New vehicle #VH-2023-045 has been added to the fleet', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), status: 'resolved', severity: 'low' },
      { id: 2, type: 'alert', title: 'High demand detected', message: 'Unusually high demand in Bole area. Consider dispatching more vehicles.', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), status: 'pending', severity: 'high', location: 'Bole, Addis Ababa' },
      { id: 3, type: 'warning', title: 'Maintenance required', message: 'Vehicle #VH-2023-012 requires scheduled maintenance', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: 'pending', severity: 'medium' },
      { id: 4, type: 'vehicle', title: 'Driver shift started', message: 'Driver John D. has started their shift', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), status: 'resolved', severity: 'low' },
    ],
  };
};

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } },
};

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  void isMobile;

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: 30000,
  });

  return (
    <PageContainer>
      <PageHeader 
        title="Operations Dashboard" 
        subtitle="Real-time overview of your transportation operations"
        actions={null}
        breadcrumbs={null}
      />
      <Box mb={2}>
        <SectionTitle variant="h6">Key Performance Indicators</SectionTitle>
        <m.div variants={containerVariants} initial="hidden" animate="visible">
          <Grid container spacing={1}>
            {([
              { title: 'Total Vehicles', value: dashboardData?.totalVehicles ?? 0, change: 2.5, color: 'primary' as const },
              { title: 'Active Drivers', value: dashboardData?.activeDrivers ?? 0, change: 1.2, color: 'success' as const },
              { title: 'Trips Today', value: dashboardData?.tripsToday ?? 0, change: 5.8, color: 'info' as const },
              { title: 'Avg. Wait Time', value: `${dashboardData?.avgWaitTime ?? 0}m`, change: -0.7, color: 'warning' as const },
              { title: 'Occupancy Rate', value: `${((dashboardData?.occupancyRate ?? 0) * 100).toFixed(1)}%`, change: 1.3, color: 'secondary' as const },
            ] as const).map((kpi) => (
              <Grid item xs={12} sm={6} md={3} key={kpi.title}>
                <m.div variants={itemVariants}>
                  <KPICard title={kpi.title} value={kpi.value} change={kpi.change} loading={isLoading} color={kpi.color} />
                </m.div>
              </Grid>
            ))}
          </Grid>
        </m.div>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <SectionTitle variant="h6">Live Vehicle Tracking</SectionTitle>
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Box sx={{ height: { xs: 400, md: 500 }, borderRadius: 2, overflow: 'hidden' }}>
              <RealTimeMap height={400} />
            </Box>
          </m.div>
        </Grid>
        <Grid item xs={12} md={4}>
          <SectionTitle variant="h6">Recent Events</SectionTitle>
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Paper sx={{ height: { xs: 400, md: 500 }, borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
                <Typography variant="subtitle2" color="text.secondary">Latest Activities</Typography>
              </Box>
              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <EventFeed events={dashboardData?.events ?? []} loading={isLoading} />
              </Box>
            </Paper>
          </m.div>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Dashboard;
