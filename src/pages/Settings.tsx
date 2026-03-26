// @ts-nocheck
import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { PageContainer, PageHeader } from '../components/layout';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as ThemeIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useThemeStore } from '../stores/themeStore';

const Settings = () => {
  const { mode: themeMode, setMode: setThemeMode } = useThemeStore();

  const [settings, setSettings] = useState({
    notifications: { email: true, push: true, sms: false },
    privacy: { shareLocation: true, showProfile: true },
    preferences: { language: 'en', currency: 'USD' },
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleNotificationChange = (field) => (event) => {
    setSettings({ ...settings, notifications: { ...settings.notifications, [field]: event.target.checked } });
  };

  const handlePrivacyChange = (field) => (event) => {
    setSettings({ ...settings, privacy: { ...settings.privacy, [field]: event.target.checked } });
  };

  const handlePreferenceChange = (field) => (event) => {
    setSettings({ ...settings, preferences: { ...settings.preferences, [field]: event.target.value } });
  };

  const handleThemeChange = (event) => {
    setThemeMode(event.target.value);
  };

  const handleSave = () => {
    setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        subtitle="Configure your application preferences"
        actions={
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
            Save Changes
          </Button>
        }
      />

      <Grid container spacing={3}>
        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Notifications</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <FormControlLabel
              control={<Switch checked={settings.notifications.email} onChange={handleNotificationChange('email')} />}
              label="Email Notifications"
            />
            <FormControlLabel
              control={<Switch checked={settings.notifications.push} onChange={handleNotificationChange('push')} />}
              label="Push Notifications"
            />
            <FormControlLabel
              control={<Switch checked={settings.notifications.sms} onChange={handleNotificationChange('sms')} />}
              label="SMS Notifications"
            />
          </Paper>
        </Grid>

        {/* Privacy */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Privacy</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <FormControlLabel
              control={<Switch checked={settings.privacy.shareLocation} onChange={handlePrivacyChange('shareLocation')} />}
              label="Share Location"
            />
            <FormControlLabel
              control={<Switch checked={settings.privacy.showProfile} onChange={handlePrivacyChange('showProfile')} />}
              label="Show Profile Publicly"
            />
          </Paper>
        </Grid>

        {/* Preferences */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ThemeIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Preferences</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select value={settings.preferences.language} label="Language" onChange={handlePreferenceChange('language')}>
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select value={themeMode} label="Theme" onChange={handleThemeChange}>
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto (System)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select value={settings.preferences.currency} label="Currency" onChange={handlePreferenceChange('currency')}>
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                    <MenuItem value="ETB">ETB (Br)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default Settings;
