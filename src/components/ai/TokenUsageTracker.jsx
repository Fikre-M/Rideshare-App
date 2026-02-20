import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import { Refresh, Info } from '@mui/icons-material';
import { useTokenUsage } from '../../hooks/useAIFeatures';

const TokenUsageTracker = ({ compact = false }) => {
  const { usage, refreshUsage, resetUsage } = useTokenUsage();

  useEffect(() => {
    // Refresh usage every 5 seconds
    const interval = setInterval(refreshUsage, 5000);
    return () => clearInterval(interval);
  }, [refreshUsage]);

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label={`${usage.total.toLocaleString()} tokens`}
          size="small"
          color="primary"
          variant="outlined"
        />
        <Tooltip title="Refresh usage">
          <IconButton size="small" onClick={refreshUsage}>
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  const estimatedCost = (usage.total / 1000) * 0.005; // Rough estimate: $0.005 per 1K tokens

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Token Usage
          </Typography>
          <Box>
            <Tooltip title="Refresh usage">
              <IconButton size="small" onClick={refreshUsage}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset counter">
              <IconButton size="small" onClick={resetUsage}>
                <Info />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" color="primary">
            {usage.total.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total tokens used
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Estimated cost: ${estimatedCost.toFixed(4)}
          </Typography>
        </Box>

        {Object.keys(usage.byFeature).length > 0 && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              Usage by Feature
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(usage.byFeature).map(([feature, tokens]) => {
                const percentage = (tokens / usage.total) * 100;
                return (
                  <Grid item xs={12} key={feature}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">
                          {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tokens.toLocaleString()} ({percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Token usage is tracked per session. Costs are estimates based on GPT-4o pricing.
            Actual costs may vary based on your OpenAI plan.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TokenUsageTracker;
