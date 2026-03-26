/**
 * Analytics Components
 * Analytics tracking integration and display components
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Send as SendIcon,
  BugReport as BugIcon,
  Lightbulb as FeatureIcon,
  ThumbUp as ImprovementIcon,
  Chat as GeneralIcon,
  Visibility as ViewIcon,
  TouchApp as ClickIcon,
  Timer as TimerIcon,
  Error as ErrorIcon,
  Star as StarIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import analyticsService from '../../services/analyticsService';
import feedbackService from '../../services/feedbackService';
import { FeedbackSubmission } from '../../services/feedbackService';

export interface AnalyticsProviderProps {
  children: React.ReactNode;
  userProperties?: {
    userId?: string;
    email?: string;
    name?: string;
    role?: string;
  };
}

/**
 * Analytics Provider - Initialize analytics tracking
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  userProperties,
}) => {
  useEffect(() => {
    // Initialize analytics
    analyticsService.initialize(userProperties).catch(error => {
      console.error('Failed to initialize analytics:', error);
    });

    // Track page view
    analyticsService.trackPageView(
      window.location.pathname,
      document.title
    );

    // Track performance metrics
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        analyticsService.trackPerformanceMetrics({
          pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
          firstContentfulPaint: 0, // Would need PerformanceObserver for this
          largestContentfulPaint: 0, // Would need PerformanceObserver for this
          cumulativeLayoutShift: 0, // Would need PerformanceObserver for this
          firstInputDelay: 0, // Would need PerformanceObserver for this
        });
      }
    }

    return () => {
      analyticsService.destroy();
    };
  }, [userProperties]);

  return <>{children}</>;
};

export interface TrackInteractionProps {
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Track user interactions
 */
export const TrackInteraction: React.FC<TrackInteractionProps> = ({
  category,
  action,
  label,
  value,
  properties,
  children,
  as: Component = 'div',
}) => {
  const handleClick = () => {
    analyticsService.trackEvent(category, action, label, value, properties);
  };

  return (
    <Component onClick={handleClick}>
      {children}
    </Component>
  );
};

export interface AnalyticsDashboardProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Analytics Dashboard - Display analytics data
 */
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  open,
  onClose,
}) => {
  const [summary, setSummary] = useState(analyticsService.getAnalyticsSummary());
  const [events, setEvents] = useState(analyticsService.getStoredEvents());
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = () => {
    setRefreshing(true);
    setTimeout(() => {
      setSummary(analyticsService.getAnalyticsSummary());
      setEvents(analyticsService.getStoredEvents());
      setRefreshing(false);
    }, 1000);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ai_features':
        return <AnalyticsIcon />;
      case 'engagement':
        return <ClickIcon />;
      case 'performance':
        return <TimerIcon />;
      case 'error':
        return <ErrorIcon />;
      default:
        return <ViewIcon />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <AnalyticsIcon />
            Analytics Dashboard
          </Box>
          <IconButton onClick={refreshData} disabled={refreshing}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Events
                </Typography>
                <Typography variant="h4" color="primary">
                  {summary.totalEvents}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Across {summary.totalSessions} sessions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Events per Session
                </Typography>
                <Typography variant="h4" color="primary">
                  {summary.averageEventsPerSession.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average engagement
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Category
                </Typography>
                <Typography variant="h4" color="primary">
                  {summary.topCategories[0]?.category || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {summary.topCategories[0]?.count || 0} events
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Categories */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Event Categories
                </Typography>
                {summary.topCategories.map((category, index) => (
                  <Box key={category.category} sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getCategoryIcon(category.category)}
                        <Typography variant="body2">
                          {category.category}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {category.count}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(category.count / summary.totalEvents) * 100}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Events */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Events
                </Typography>
                <List dense>
                  {events.slice(0, 10).map((event, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {getCategoryIcon(event.category)}
                      </ListItemIcon>
                      <ListItemText
                        primary={`${event.category}: ${event.action}`}
                        secondary={`${event.label || ''} • ${formatTimestamp(event.timestamp)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (feedback: FeedbackSubmission) => void;
}

/**
 * Feedback Dialog - Collect user feedback
 */
export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<FeedbackSubmission['type']>('general');
  const [rating, setRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const feedback = await feedbackService.submitFeedback({
        type,
        rating: rating > 0 ? rating : undefined,
        title: title.trim(),
        description: description.trim(),
        email: email.trim() || undefined,
      });

      // Track feedback submission
      analyticsService.trackEvent('feedback', 'submitted', type, rating, {
        feedbackId: feedback.id,
        hasEmail: !!email,
      });

      onSubmit?.(feedback);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      // Reset form
      setType('general');
      setRating(0);
      setTitle('');
      setDescription('');
      setEmail('');
      setSubmitted(false);
      onClose();
    }
  };

  const getTypeIcon = (type: FeedbackSubmission['type']) => {
    switch (type) {
      case 'bug':
        return <BugIcon />;
      case 'feature':
        return <FeatureIcon />;
      case 'improvement':
        return <ImprovementIcon />;
      case 'general':
        return <GeneralIcon />;
      default:
        return <GeneralIcon />;
    }
  };

  const getTypeColor = (type: FeedbackSubmission['type']) => {
    switch (type) {
      case 'bug':
        return 'error';
      case 'feature':
        return 'primary';
      case 'improvement':
        return 'warning';
      case 'general':
        return 'default';
      default:
        return 'default';
    }
  };

  if (submitted) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <StarIcon color="success" />
            Feedback Submitted!
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Thank you for your feedback! We appreciate your input and will review it shortly.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Your feedback helps us improve the application for everyone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SendIcon />
          Send Feedback
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Feedback Type */}
          <FormControl fullWidth>
            <InputLabel>Feedback Type</InputLabel>
            <Select
              value={type}
              label="Feedback Type"
              onChange={(e) => setType(e.target.value as FeedbackSubmission['type'])}
            >
              <MenuItem value="bug">
                <Box display="flex" alignItems="center" gap={1}>
                  <BugIcon fontSize="small" />
                  Bug Report
                </Box>
              </MenuItem>
              <MenuItem value="feature">
                <Box display="flex" alignItems="center" gap={1}>
                  <FeatureIcon fontSize="small" />
                  Feature Request
                </Box>
              </MenuItem>
              <MenuItem value="improvement">
                <Box display="flex" alignItems="center" gap={1}>
                  <ImprovementIcon fontSize="small" />
                  Improvement
                </Box>
              </MenuItem>
              <MenuItem value="general">
                <Box display="flex" alignItems="center" gap={1}>
                  <GeneralIcon fontSize="small" />
                  General Feedback
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Rating */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Rating (Optional)
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue || 0)}
              size="large"
            />
          </Box>

          {/* Title */}
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of your feedback"
            required
          />

          {/* Description */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide detailed information about your feedback"
            required
          />

          {/* Email */}
          <TextField
            fullWidth
            type="email"
            label="Email (Optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            helperText="Only if you'd like us to follow up with you"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!title.trim() || !description.trim() || submitting}
          startIcon={<SendIcon />}
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export interface FeedbackButtonProps {
  onOpen: () => void;
  showAnalytics?: boolean;
  onOpenAnalytics?: () => void;
}

/**
 * Feedback Button - Floating action button for feedback
 */
export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  onOpen,
  showAnalytics = false,
  onOpenAnalytics,
}) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        alignItems: 'flex-end',
        zIndex: 1000,
      }}
    >
      {showAnalytics && onOpenAnalytics && (
        <Tooltip title="Analytics Dashboard">
          <IconButton
            color="primary"
            onClick={onOpenAnalytics}
            sx={{
              backgroundColor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                backgroundColor: 'grey.100',
              },
            }}
          >
            <AnalyticsIcon />
          </IconButton>
        </Tooltip>
      )}
      
      <Tooltip title="Send Feedback">
        <Button
          variant="contained"
          color="primary"
          startIcon={<SendIcon />}
          onClick={onOpen}
          sx={{
            borderRadius: '20px',
            boxShadow: 3,
            textTransform: 'none',
          }}
        >
          Feedback
        </Button>
      </Tooltip>
    </Box>
  );
};

export default {
  AnalyticsProvider,
  TrackInteraction,
  AnalyticsDashboard,
  FeedbackDialog,
  FeedbackButton,
};
