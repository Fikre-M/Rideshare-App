import { Grid } from '@mui/material';
import KPICard from './KPICard';
import { TrendingUp, LocalShipping, People, MonetizationOn } from '@mui/icons-material';

const DashboardGrid = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Total Rides"
          value="1,234"
          icon={LocalShipping}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Active Drivers"
          value="42"
          icon={People}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Revenue"
          value="$12,345"
          icon={MonetizationOn}
          color="warning"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KPICard
          title="Growth"
          value="+12.5%"
          icon={TrendingUp}
          color="info"
        />
      </Grid>
    </Grid>
  );
};

export default DashboardGrid;
