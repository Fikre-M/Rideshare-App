/**
 * AI Model Selector Component
 * Allows switching between GPT-4o, GPT-4o-mini, and Claude 3.5 Sonnet
 * Shows cost estimates and model capabilities
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { Zap, DollarSign, Clock, Brain, Key, CheckCircle } from 'lucide-react';
import { m } from 'framer-motion';
import { useModelStore, AIModel, MODEL_CONFIGS } from '../../stores/modelStore';

interface ModelSelectorProps {
  estimatedInputTokens?: number;
  estimatedOutputTokens?: number;
  onModelChange?: (model: AIModel) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  estimatedInputTokens = 1000,
  estimatedOutputTokens = 500,
  onModelChange,
}) => {
  const {
    selectedModel,
    apiKeys,
    usageStats,
    setModel,
    setApiKey,
    estimateCost,
    getModelConfig,
    isModelAvailable,
  } = useModelStore();

  const [apiKeyDialog, setApiKeyDialog] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<'openai' | 'anthropic'>('openai');
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleModelChange = (model: AIModel) => {
    if (isModelAvailable(model)) {
      setModel(model);
      onModelChange?.(model);
    } else {
      const config = getModelConfig(model);
      setCurrentProvider(config.provider);
      setApiKeyDialog(true);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(currentProvider, apiKeyInput.trim());
      setApiKeyInput('');
      setApiKeyDialog(false);
    }
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'fast':
        return 'success';
      case 'medium':
        return 'warning';
      case 'slow':
        return 'error';
      default:
        return 'default';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'standard':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Brain size={24} />
        AI Model Selection
      </Typography>

      <RadioGroup value={selectedModel} onChange={(e) => handleModelChange(e.target.value as AIModel)}>
        {Object.values(MODEL_CONFIGS).map((config) => {
          const cost = estimateCost(config.id, estimatedInputTokens, estimatedOutputTokens);
          const available = isModelAvailable(config.id);
          const stats = usageStats[config.id];

          return (
            <m.div
              key={config.id}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                sx={{
                  mb: 2,
                  border: selectedModel === config.id ? '2px solid' : '1px solid',
                  borderColor: selectedModel === config.id ? 'primary.main' : 'divider',
                  opacity: available ? 1 : 0.6,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleModelChange(config.id)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <FormControlLabel
                      value={config.id}
                      control={<Radio />}
                      label=""
                      disabled={!available}
                      sx={{ m: 0 }}
                    />

                    <Box sx={{ flex: 1 }}>
                      {/* Model Name and Status */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6">{config.name}</Typography>
                        {available ? (
                          <Chip
                            icon={<CheckCircle size={14} />}
                            label="Available"
                            size="small"
                            color="success"
                          />
                        ) : (
                          <Chip
                            icon={<Key size={14} />}
                            label="API Key Required"
                            size="small"
                            color="warning"
                          />
                        )}
                      </Box>

                      {/* Description */}
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {config.description}
                      </Typography>

                      {/* Capabilities */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1, mb: 2 }}>
                        <Tooltip title="Response Speed">
                          <Chip
                            icon={<Clock size={14} />}
                            label={config.speed}
                            size="small"
                            color={getSpeedColor(config.speed) as any}
                            variant="outlined"
                          />
                        </Tooltip>
                        <Tooltip title="Output Quality">
                          <Chip
                            icon={<Zap size={14} />}
                            label={config.quality}
                            size="small"
                            color={getQualityColor(config.quality) as any}
                            variant="outlined"
                          />
                        </Tooltip>
                        <Tooltip title="Max Context Length">
                          <Chip
                            label={`${(config.maxTokens / 1000).toFixed(0)}K tokens`}
                            size="small"
                            variant="outlined"
                          />
                        </Tooltip>
                      </Box>

                      {/* Cost Estimate */}
                      <Box
                        sx={{
                          p: 1.5,
                          background: 'rgba(0, 0, 0, 0.03)',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Estimated Cost per Query:
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <DollarSign size={14} />
                            {cost.toFixed(4)}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Input: ${config.costPer1kTokens.input.toFixed(4)}/1K •
                          Output: ${config.costPer1kTokens.output.toFixed(4)}/1K
                        </Typography>
                      </Box>

                      {/* Usage Stats */}
                      {stats && (
                        <Box
                          sx={{
                            p: 1.5,
                            background: 'rgba(25, 118, 210, 0.05)',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            Your Usage:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                            <Typography variant="caption">
                              {stats.requests} requests
                            </Typography>
                            <Typography variant="caption">
                              ${stats.totalCost.toFixed(2)} spent
                            </Typography>
                            <Typography variant="caption">
                              {(stats.totalTokens / 1000).toFixed(1)}K tokens
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </m.div>
          );
        })}
      </RadioGroup>

      {/* Total Usage Summary */}
      {Object.keys(usageStats).length > 0 && (
        <Card sx={{ mt: 2, background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Total Usage Summary
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
              <Box>
                <Typography variant="h5" color="primary">
                  {Object.values(usageStats).reduce((sum, stat) => sum + stat.requests, 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Requests
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" color="primary">
                  ${Object.values(usageStats).reduce((sum, stat) => sum + stat.totalCost, 0).toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Cost
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" color="primary">
                  {(Object.values(usageStats).reduce((sum, stat) => sum + stat.totalTokens, 0) / 1000).toFixed(1)}K
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Tokens
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* API Key Dialog */}
      <Dialog open={apiKeyDialog} onClose={() => setApiKeyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add {currentProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API Key
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            To use this model, you need to provide your{' '}
            {currentProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API key.
            Your key is stored locally and never sent to our servers.
          </Alert>
          <TextField
            fullWidth
            label="API Key"
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder={`sk-...`}
            helperText={
              currentProvider === 'openai'
                ? 'Get your key from platform.openai.com'
                : 'Get your key from console.anthropic.com'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiKeyDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveApiKey} variant="contained" disabled={!apiKeyInput.trim()}>
            Save Key
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModelSelector;
