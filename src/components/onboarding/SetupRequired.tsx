import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Key as KeyIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import ApiKeySetup from '../settings/ApiKeySetup';

export default function SetupRequired() {
  const [showSetupModal, setShowSetupModal] = useState(false);

  const features = [
    {
      icon: <SecurityIcon color="primary" />,
      title: 'Secure & Private',
      description: 'Your API keys are stored only in your browser session and never sent to our servers.',
    },
    {
      icon: <SpeedIcon color="primary" />,
      title: 'No Backend Required',
      description: 'Connect directly to AI services without any intermediary servers.',
    },
    {
      icon: <KeyIcon color="primary" />,
      title: 'Your Keys, Your Control',
      description: 'Use your own API keys and stay within your usage limits and billing.',
    },
  ];

  const steps = [
    'Click "Configure API Keys" below',
    'Choose a service (Google AI, OpenAI, or Mapbox)',
    'Paste your API key and click "Validate"',
    'Save and start using the app!',
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              color: 'white',
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Welcome to AI Rideshare Platform
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              mb: 4,
            }}
          >
            Let's get you set up in just a few minutes
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="center" mb={2}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom align="center">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card
          sx={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            mb: 4,
          }}
        >
          <CardContent>
            <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
              Quick Setup Guide
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <List>
              {steps.map((step, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {index + 1}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={step}
                    primaryTypographyProps={{
                      variant: 'body1',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Box textAlign="center">
          <Button
            variant="contained"
            size="large"
            onClick={() => setShowSetupModal(true)}
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.1rem',
              background: 'white',
              color: '#667eea',
              '&:hover': {
                background: 'rgba(255,255,255,0.9)',
              },
            }}
            startIcon={<KeyIcon />}
          >
            Configure API Keys
          </Button>
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            You'll need at least one API key to continue
          </Typography>
        </Box>

        <Box mt={6} textAlign="center">
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Need help getting API keys?{' '}
            <Button
              color="inherit"
              sx={{ color: 'white', textDecoration: 'underline' }}
              href="https://github.com/yourusername/ai-rideshare#api-keys"
              target="_blank"
            >
              View Documentation
            </Button>
          </Typography>
        </Box>
      </Container>

      <ApiKeySetup
        open={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        required={true}
      />
    </Box>
  );
}
