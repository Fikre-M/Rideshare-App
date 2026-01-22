import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  DirectionsCar as CarIcon,
  Payment as PaymentIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  EmojiEvents as AchievementIcon,
  TrendingUp as StatsIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const ProfileCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  position: 'relative',
  overflow: 'visible',
}));

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  height: '100%',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const AchievementBadge = styled(Box)(({ theme, earned }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderRadius: 16,
  backgroundColor: earned ? `${theme.palette.primary.main}15` : theme.palette.action.disabled,
  border: earned ? `2px solid ${theme.palette.primary.main}` : `2px solid ${theme.palette.divider}`,
  opacity: earned ? 1 : 0.5,
  transition: 'all 0.3s ease',
}));

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    bio: 'AI enthusiast and frequent rideshare user',
    preferences: {
      notifications: true,
      locationSharing: true,
      autoPayment: true,
      ecoMode: false,
    },
  });

  const handleInputChange = (field) => (event) => {
    setProfileData({
      ...profileData,
      [field]: event.target.value,
    });
  };

  const handlePreferenceChange = (field) => (event) => {
    setProfileData({
      ...profileData,
      preferences: {
        ...profileData.preferences,
        [field]: event.target.checked,
      },
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, this would save to the backend
  };

  const stats = [
    { label: 'Total Rides', value: '247', icon: CarIcon, color: 'primary' },
    { label: 'Rating', value: '4.9', icon: StarIcon, color: 'warning' },
    { label: 'Money Saved', value: '$1,234', icon: PaymentIcon, color: 'success' },
    { label: 'CO₂ Reduced', value: '45kg', icon: StatsIcon, color: 'info' },
  ];

  const achievements = [
    { id: 1, name: 'First Ride', description: 'Complete your first ride', earned: true, icon: '🚗' },
    { id: 2, name: 'Eco Warrior', description: 'Choose eco-friendly rides 10 times', earned: true, icon: '🌱' },
    { id: 3, name: 'Night Owl', description: 'Take 5 rides after midnight', earned: true, icon: '🦉' },
    { id: 4, name: 'Frequent Rider', description: 'Complete 100 rides', earned: true, icon: '⭐' },
    { id: 5, name: 'AI Explorer', description: 'Use all AI features', earned: false, icon: '🤖' },
    { id: 6, name: 'Social Butterfly', description: 'Share 10 rides', earned: false, icon: '🦋' },
  ];

  const recentActivity = [
    { id: 1, action: 'Completed ride to Downtown', time: '2 hours ago', icon: CarIcon },
    { id: 2, action: 'Updated payment method', time: '1 day ago', icon: PaymentIcon },
    { id: 3, action: 'Earned "Night Owl" achievement', time: '3 days ago', icon: AchievementIcon },
    { id: 4, action: 'Rated driver 5 stars', time: '1 week ago', icon: StarIcon },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProfileCard>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={user?.avatar}
                      sx={{
                        width: 100,
                        height: 100,
                        mr: 3,
                        border: '4px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      {user?.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      {isEditing ? (
                        <TextField
                          value={profileData.name}
                          onChange={handleInputChange('name')}
                          variant="outlined"
                          size="small"
                          sx={{
                            mb: 1,
                            '& .MuiOutlinedInput-root': {
                              color: 'white',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            },
                          }}
                        />
                      ) : (
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                          {profileData.name}
                        </Typography>
                      )}
                      <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                        {profileData.email}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label={user?.roles?.[0] || 'User'} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                        <Chip label="Verified" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                      </Box>
                    </Box>
                  </Box>
                  <Box>
                    {isEditing ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton onClick={handleSave} sx={{ color: 'white' }}>
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={() => setIsEditing(false)} sx={{ color: 'white' }}>
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <IconButton onClick={() => setIsEditing(true)} sx={{ color: 'white' }}>
                        <EditIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </ProfileCard>
          </motion.div>
        </Grid>

        {/* Stats */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Your Stats
          </Typography>
          <Grid container spacing={2}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <StatsCard>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: `${stat.color}.main`,
                          width: 56,
                          height: 56,
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        <stat.icon />
                      </Avatar>
                      <Typography variant="h4" fontWeight="bold" color={`${stat.color}.main`}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </CardContent>
                  </StatsCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Achievements */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Achievements
          </Typography>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Grid container spacing={2}>
              {achievements.map((achievement) => (
                <Grid item xs={6} md={4} key={achievement.id}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AchievementBadge earned={achievement.earned}>
                      <Typography variant="h3" sx={{ mb: 1 }}>
                        {achievement.icon}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" textAlign="center">
                        {achievement.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" textAlign="center">
                        {achievement.description}
                      </Typography>
                    </AchievementBadge>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {achievements.filter(a => a.earned).length} of {achievements.length} achievements unlocked
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(achievements.filter(a => a.earned).length / achievements.length) * 100}
                sx={{ mt: 1, borderRadius: 2, height: 8 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Recent Activity
          </Typography>
          <Paper sx={{ borderRadius: 3 }}>
            <List>
              {recentActivity.map((activity, index) => (
                <ListItem key={activity.id}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                      <activity.icon fontSize="small" />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.action}
                    secondary={activity.time}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Settings */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Preferences
          </Typography>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Privacy & Notifications
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.preferences.notifications}
                        onChange={handlePreferenceChange('notifications')}
                      />
                    }
                    label="Push Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.preferences.locationSharing}
                        onChange={handlePreferenceChange('locationSharing')}
                      />
                    }
                    label="Location Sharing"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.preferences.autoPayment}
                        onChange={handlePreferenceChange('autoPayment')}
                      />
                    }
                    label="Auto Payment"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.preferences.ecoMode}
                        onChange={handlePreferenceChange('ecoMode')}
                      />
                    }
                    label="Eco-Friendly Mode"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Personal Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Phone Number"
                    value={profileData.phone}
                    onChange={handleInputChange('phone')}
                    disabled={!isEditing}
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    label="Bio"
                    value={profileData.bio}
                    onChange={handleInputChange('bio')}
                    disabled={!isEditing}
                    variant="outlined"
                    size="small"
                    multiline
                    rows={3}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;