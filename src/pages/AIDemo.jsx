import React from 'react';
import { Box, Container, Typography, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Settings } from '@mui/icons-material';
import AIFeaturesDemo from '../components/ai/AIFeaturesDemo';
import TokenUsageTracker from '../components/ai/TokenUsageTracker';
import { useApiKeyStore } from '../stores/apiKeyStore';

const AIDemo = () => {
  const navigate = useNavigate();
  const hasOpenAI = useApiKeyStore(state => state.hasKey('openAI'));
  const hasMapbox = useApiKeyStore(state => state.hasKey('mapbox'));

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" gutterBottom>
              AI Features Demo
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Test all AI-powered features with real OpenAI and Mapbox integration
            </Typography>
          </Box>
          
          <Box sx={{ width: 300 }}>
            <TokenUsageTracker compact />
          </Box>
        </Box>

        {(!hasOpenAI || !hasMapbox) && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small"
                startIcon={<Settings />}
                onClick={() => navigate('/settings')}
              >
                Configure
              </Button>
            }
          >
            {!hasOpenAI && !hasMapbox && 'OpenAI and Mapbox API keys are not configured. '}
            {!hasOpenAI && hasMapbox && 'OpenAI API key is not configured. '}
            {hasOpenAI && !hasMapbox && 'Mapbox access token is not configured. '}
            Some features may not work without proper API keys.
          </Alert>
        )}

        <AIFeaturesDemo />

        <Box sx={{ mt: 4 }}>
          <TokenUsageTracker />
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            About This Demo
          </Typography>
          <Typography variant="body2" paragraph>
            This demo showcases real AI integration using OpenAI GPT-4o and Mapbox APIs. All features run directly from your browser using your API keys.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Features:</strong>
          </Typography>
          <ul>
            <li>
              <Typography variant="body2">
                <strong>Smart Matching:</strong> AI analyzes drivers and recommends best matches based on multiple factors
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Dynamic Pricing:</strong> Real-time surge pricing calculation based on demand, weather, and events
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Route Optimization:</strong> Fetches real routes from Mapbox and uses AI to recommend the best option
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Demand Prediction:</strong> Forecasts ride demand for the next 6 hours with actionable insights
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Predictive Analytics:</strong> Comprehensive business analytics with revenue forecasting and recommendations
              </Typography>
            </li>
          </ul>
          <Typography variant="body2" paragraph>
            <strong>Token Usage:</strong> All API calls are tracked in real-time. You can monitor your token consumption and estimated costs.
          </Typography>
          <Typography variant="body2">
            <strong>Caching:</strong> Results are cached for 5 minutes to reduce API calls and costs.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default AIDemo;
