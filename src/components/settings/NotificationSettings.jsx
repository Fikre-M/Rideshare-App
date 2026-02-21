import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import { Bell, BellOff, Smartphone, CheckCircle } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { m } from 'framer-motion';

const NotificationSettings = () => {
  const {
    permission,
    enabled,
    isSupported,
    notificationHistory,
    requestPermission,
    toggleNotifications,
    clearHistory,
  } = useNotifications();

  const [loading, setLoading] = useState(false);

  const handleToggle = async (event) => {
    setLoading(true);
    const newValue = event.target.checked;
    await toggleNotifications(newValue);
    setLoading(false);
  };

  const handleRequestPermission = async () => {
    setLoading(true);
    await requestPermission();
    setLoading(false);
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { color: 'success', text: 'Granted', icon: <CheckCircle size={16} /> };
      case 'denied':
        return { color: 'error', text: 'Denied', icon: <BellOff size={16} /> };
      default:
        return { color: 'warning', text: 'Not Requested', icon: <Bell size={16} /> };
    }
  };

  const status = getPermissionStatus();

  if (!isSupported) {
    return (
      <Card>
        <CardContent>
          <Alert severity="warning">
            Push notifications are not supported in your browser.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Bell size={24} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                Push Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get notified about driver matches and trip updates
              </Typography>
            </Box>
          </Box>

          {/* Permission Status */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Permission Status:
              </Typography>
              <Chip
                icon={status.icon}
                label={status.text}
                color={status.color}
                size="small"
              />
            </Box>

            {permission === 'default' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                You need to grant notification permission to receive updates.
              </Alert>
            )}

            {permission === 'denied' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Notification permission was denied. Please enable it in your browser settings.
              </Alert>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Enable/Disable Toggle */}
          <Box sx={{ mb: 3 }}>
            {permission === 'granted' ? (
              <FormControlLabel
                control={
                  <Switch
                    checked={enabled}
                    onChange={handleToggle}
                    disabled={loading}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      Enable Notifications
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Receive push notifications for important updates
                    </Typography>
                  </Box>
                }
              />
            ) : (
              <Button
                variant="contained"
                startIcon={<Smartphone />}
                onClick={handleRequestPermission}
                disabled={loading || permission === 'denied'}
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                  },
                }}
              >
                {loading ? 'Requesting...' : 'Request Permission'}
              </Button>
            )}
          </Box>

          {/* Notification Types */}
          {enabled && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                You'll receive notifications for:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Driver Matches"
                    secondary="When a driver is matched to your ride request"
                  />
                  <ListItemSecondaryAction>
                    <Chip label="Enabled" color="success" size="small" />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Driver Arriving"
                    secondary="When your driver is approaching"
                  />
                  <ListItemSecondaryAction>
                    <Chip label="Enabled" color="success" size="small" />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Trip Updates"
                    secondary="Important updates about your trip"
                  />
                  <ListItemSecondaryAction>
                    <Chip label="Enabled" color="success" size="small" />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Price Drops"
                    secondary="When prices drop for your saved routes"
                  />
                  <ListItemSecondaryAction>
                    <Chip label="Enabled" color="success" size="small" />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </>
          )}

          {/* Notification History */}
          {notificationHistory.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Recent Notifications ({notificationHistory.length})
                </Typography>
                <Button size="small" onClick={clearHistory} color="error">
                  Clear History
                </Button>
              </Box>
              <List dense>
                {notificationHistory.slice(0, 5).map((notification) => (
                  <ListItem key={notification.id}>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <>
                          {notification.body}
                          <br />
                          <Typography variant="caption" color="text.disabled">
                            {new Date(notification.timestamp).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </CardContent>
      </Card>
    </m.div>
  );
};

export default NotificationSettings;
