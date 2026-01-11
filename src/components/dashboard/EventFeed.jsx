import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Divider, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  LocalShipping as VehicleIcon,
  Warning as WarningIcon,
  Notifications as AlertIcon,
  CheckCircle as ResolvedIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const EventItem = styled(ListItem)(({ theme, severity }) => ({
  padding: theme.spacing(1.5, 2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  borderLeft: `3px solid ${
    severity === 'high' 
      ? theme.palette.error.main 
      : severity === 'medium' 
        ? theme.palette.warning.main 
        : theme.palette.info.main
  }`,
}));

const EventIcon = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: theme.palette[color || 'primary'].light,
  color: theme.palette[color || 'primary'].main,
  marginRight: theme.spacing(2),
}));

const EventFeed = ({ events = [], loading = false }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case 'vehicle':
        return <VehicleIcon />;
      case 'alert':
        return <AlertIcon />;
      case 'warning':
        return <WarningIcon />;
      default:
        return <AlertIcon />;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <Chip 
            icon={<ResolvedIcon fontSize="small" />} 
            label="Resolved" 
            size="small" 
            color="success"
            variant="outlined"
          />
        );
      case 'pending':
        return (
          <Chip 
            icon={<PendingIcon fontSize="small" />} 
            label="Pending" 
            size="small" 
            color="warning"
            variant="outlined"
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box p={2}>
        {[1, 2, 3, 4].map((item) => (
          <Box key={item} mb={2}>
            <Box display="flex" alignItems="center" mb={1}>
              <Box width={36} height={36} bgcolor="action.hover" borderRadius="50%" mr={2} />
              <Box>
                <Box width={120} height={20} bgcolor="action.hover" mb={0.5} />
                <Box width={80} height={16} bgcolor="action.hover" />
              </Box>
            </Box>
            <Box ml="52px">
              <Box width="100%" height={16} bgcolor="action.hover" mb={0.5} />
              <Box width="70%" height={16} bgcolor="action.hover" />
            </Box>
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Box p={3} textAlign="center" color="text.secondary">
        <Typography variant="body2">No recent events to display</Typography>
      </Box>
    );
  }

  return (
    <List disablePadding>
      {events.map((event, index) => (
        <Box key={event.id || index}>
          <EventItem alignItems="flex-start" severity={event.severity || 'low'}>
            <ListItemIcon sx={{ minWidth: 'auto' }}>
              <EventIcon color={event.color || 'primary'}>
                {getEventIcon(event.type)}
              </EventIcon>
            </ListItemIcon>
            <Box flex={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="subtitle2" fontWeight="medium">
                  {event.title}
                </Typography>
                {event.status && getStatusChip(event.status)}
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                {event.message}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </Typography>
                {event.location && (
                  <Typography variant="caption" color="text.secondary">
                    {event.location}
                  </Typography>
                )}
              </Box>
            </Box>
          </EventItem>
          {index < events.length - 1 && <Divider variant="inset" component="li" />}
        </Box>
      ))}
    </List>
  );
};

export default EventFeed;
