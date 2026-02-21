import { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Divider,
  Button,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  DirectionsCar as CarIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { m, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const NotificationMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 16,
    minWidth: 360,
    maxWidth: 400,
    maxHeight: 500,
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    border: `1px solid ${theme.palette.divider}`,
  },
}));

const NotificationItem = styled(ListItem)(({ theme, unread }) => ({
  borderRadius: 12,
  margin: theme.spacing(0.5, 1),
  backgroundColor: unread ? `${theme.palette.primary.main}08` : 'transparent',
  border: unread ? `1px solid ${theme.palette.primary.main}20` : '1px solid transparent',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  transition: 'all 0.2s ease',
}));

const mockNotifications = [
  {
    id: 1,
    type: 'ride',
    title: 'Ride Completed',
    message: 'Your ride to Downtown has been completed successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    unread: true,
    icon: CarIcon,
    color: 'success',
  },
  {
    id: 2,
    type: 'payment',
    title: 'Payment Processed',
    message: '$15.50 has been charged to your card ending in 4532',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    unread: true,
    icon: MoneyIcon,
    color: 'primary',
  },
  {
    id: 3,
    type: 'promotion',
    title: 'Special Offer',
    message: '20% off your next 3 rides! Use code SAVE20',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unread: false,
    icon: InfoIcon,
    color: 'info',
  },
  {
    id: 4,
    type: 'system',
    title: 'AI Route Optimization',
    message: 'New AI-powered route saved you 8 minutes on your last trip',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    unread: false,
    icon: SuccessIcon,
    color: 'success',
  },
  {
    id: 5,
    type: 'warning',
    title: 'Traffic Alert',
    message: 'Heavy traffic detected on your usual route to work',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    unread: false,
    icon: WarningIcon,
    color: 'warning',
  },
];

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState(mockNotifications);
  const open = Boolean(anchorEl);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification = {
        id: Date.now(),
        type: 'system',
        title: 'AI Update',
        message: 'Your AI assistant learned something new from your preferences',
        timestamp: new Date(),
        unread: true,
        icon: InfoIcon,
        color: 'info',
      };
      
      // Add new notification occasionally
      if (Math.random() > 0.95) {
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: 'inherit',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <NotificationMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </Box>
        </Box>

        <Divider />

        <List sx={{ p: 0, maxHeight: 400, overflowY: 'auto' }}>
          <AnimatePresence>
            {notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <m.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <NotificationItem
                    unread={notification.unread}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: `${notification.color}.main`,
                          width: 40,
                          height: 40,
                        }}
                      >
                        <IconComponent fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {notification.title}
                          </Typography>
                          {notification.unread && (
                            <Chip
                              label="New"
                              size="small"
                              color="primary"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </Typography>
                        </Box>
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </NotificationItem>
                </m.div>
              );
            })}
          </AnimatePresence>
        </List>

        {notifications.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        )}

        <Divider />
        <Box sx={{ p: 2 }}>
          <Button fullWidth variant="outlined" size="small">
            View All Notifications
          </Button>
        </Box>
      </NotificationMenu>
    </>
  );
};

export default NotificationCenter;