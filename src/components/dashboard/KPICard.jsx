import { Box, Typography, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { styled } from '@mui/material/styles';

const StatCard = styled(Box)(({ theme, color = 'primary' }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.5),
  height: '100%',
  minHeight: 100,
  boxShadow: theme.shadows[2],
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
  borderLeft: `4px solid ${theme.palette[color].main}`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    minHeight: 90,
  },
  [theme.breakpoints.down('xs')]: {
    padding: theme.spacing(0.75),
    minHeight: 80,
  },
}));

const KPICard = ({ title, value, change, loading = false, color = 'primary' }) => {
  const isPositive = change >= 0;
  
  return (
    <StatCard color={color}>
      {loading ? (
        <>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 1 }} />
        </>
      ) : (
        <>
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            gutterBottom
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          <Box display="flex" alignItems="flex-end" gap={1}>
            <Typography 
              variant="h4" 
              component="div" 
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                lineHeight: 1.1,
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {change !== undefined && (
              <Box
                display="flex"
                alignItems="center"
                color={isPositive ? 'success.main' : 'error.main'}
                mb={0.5}
              >
                {isPositive ? (
                  <TrendingUpIcon fontSize="small" />
                ) : (
                  <TrendingDownIcon fontSize="small" />
                )}
                <Typography variant="body2" ml={0.5}>
                  {Math.abs(change)}%
                </Typography>
              </Box>
            )}
          </Box>
        </>
      )}
    </StatCard>
  );
};

export default KPICard;
