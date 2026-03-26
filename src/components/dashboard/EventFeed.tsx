import { Box, Typography, List, ListItem, ListItemIcon, Divider, Chip } from '@mui/material';
import {
  LocalShipping as VehicleIcon,
  Warning as WarningIcon,
  Notifications as AlertIcon,
  CheckCircle as ResolvedIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

export interface DashboardEvent {
  id: number;
  type: 'vehicle' | 'alert' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  status: 'resolved' | 'pending';
  severity: 'low' | 'medium' | 'high';
  location?: string;
  color?: string;
}

interface EventFeedProps {
  events?: DashboardEvent[];
  loading?: boolean;
}

const EventFeed = ({ events = [], loading = false }: EventFeedProps) => {
  const getEventIcon = (type: DashboardEvent['type']) => {
    switch (type) {
      case 'vehicle': return <VehicleIcon />;
      case 'alert':   return <AlertIcon />;
      case 'warning': return <WarningIcon />;
      default:        return <AlertIcon />;
    }
  };

  const getStatusChip = (status: DashboardEvent['status']) => {
    if (status === 'resolved')
      return <Chip icon={<ResolvedIcon fontSize="small" />} label="Resolved" size="small" color="success" variant="outlined" />;
    if (status === 'pending')
      return <Chip icon={<PendingIcon fontSize="small" />} label="Pending" size="small" color="warning" variant="outlined" />;
    return null;
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
        <Box key={event.id}>
          <ListItem
            alignItems="flex-start"
            sx={{
              px: 2, py: 1.5,
              '&:hover': { bgcolor: 'action.hover' },
              borderLeft: `3px solid`,
              borderColor:
                event.severity === 'high' ? 'error.main'
                : event.severity === 'medium' ? 'warning.main'
                : 'info.main',
            }}
          >
            <ListItemIcon sx={{ minWidth: 'auto' }}>
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: '50%', mr: 2,
                  bgcolor: `${event.color ?? 'primary'}.light`,
                  color: `${event.color ?? 'primary'}.main`,
                }}
              >
                {getEventIcon(event.type)}
              </Box>
            </ListItemIcon>
            <Box flex={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="subtitle2" fontWeight="medium">{event.title}</Typography>
                {getStatusChip(event.status)}
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>{event.message}</Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </Typography>
                {event.location && (
                  <Typography variant="caption" color="text.secondary">{event.location}</Typography>
                )}
              </Box>
            </Box>
          </ListItem>
          {index < events.length - 1 && <Divider variant="inset" component="li" />}
        </Box>
      ))}
    </List>
  );
};

export default EventFeed;
