import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  Link,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useApiKeyStore } from '../../stores/apiKeyStore';
import keyValidator from '../../services/keyValidator';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`api-key-tabpanel-${index}`}
      aria-labelledby={`api-key-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ApiKeySetup({ open, onClose, required = false }) {
  const {
    keys,
    setKey,
    setKeys,
    validationStatus,
    validationErrors,
    setValidationStatus,
    completeSetup,
    clearKey,
  } = useApiKeyStore();

  const [tabValue, setTabValue] = useState(0);
  const [showKeys, setShowKeys] = useState({
    googleAI: false,
    openAI: false,
    mapbox: false,
  });
  const [localKeys, setLocalKeys] = useState({
    googleAI: keys.googleAI || '',
    googleAIModel: keys.googleAIModel || 'gemini-2.5-flash',
    openAI: keys.openAI || '',
    mapbox: keys.mapbox || '',
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const toggleShowKey = (keyType) => {
    setShowKeys(prev => ({ ...prev, [keyType]: !prev[keyType] }));
  };

  const handleLocalKeyChange = (keyType, value) => {
    setLocalKeys(prev => ({ ...prev, [keyType]: value }));
    // Clear validation status when key changes
    setValidationStatus(keyType, null);
  };

  const handleValidate = async (keyType) => {
    const keyValue = localKeys[keyType];
    
    if (!keyValue || keyValue.trim() === '') {
      setValidationStatus(keyType, 'invalid', 'API key is required');
      return;
    }

    setValidationStatus(keyType, 'validating');

    try {
      let result;
      
      if (keyType === 'googleAI') {
        result = await keyValidator.validateGoogleAI(keyValue, localKeys.googleAIModel);
      } else if (keyType === 'openAI') {
        result = await keyValidator.validateOpenAI(keyValue);
      } else if (keyType === 'mapbox') {
        result = await keyValidator.validateMapbox(keyValue);
      }

      if (result.valid) {
        setValidationStatus(keyType, 'valid');
        setKey(keyType, keyValue);
        if (keyType === 'googleAI') {
          setKey('googleAIModel', localKeys.googleAIModel);
        }
      } else {
        setValidationStatus(keyType, 'invalid', result.error);
      }
    } catch (error) {
      setValidationStatus(keyType, 'invalid', `Validation failed: ${error.message}`);
    }
  };

  const handleSave = () => {
    // Save all keys that have been validated
    const keysToSave = {};
    
    if (validationStatus.googleAI === 'valid') {
      keysToSave.googleAI = localKeys.googleAI;
      keysToSave.googleAIModel = localKeys.googleAIModel;
    }
    if (validationStatus.openAI === 'valid') {
      keysToSave.openAI = localKeys.openAI;
    }
    if (validationStatus.mapbox === 'valid') {
      keysToSave.mapbox = localKeys.mapbox;
    }

    setKeys(keysToSave);
    completeSetup();
    onClose();
  };

  const handleSkip = () => {
    if (!required) {
      completeSetup();
      onClose();
    }
  };

  const handleClearKey = (keyType) => {
    clearKey(keyType);
    setLocalKeys(prev => ({ ...prev, [keyType]: '' }));
    setValidationStatus(keyType, null);
  };

  const getValidationIcon = (keyType) => {
    const status = validationStatus[keyType];
    
    if (status === 'validating') {
      return <CircularProgress size={20} />;
    } else if (status === 'valid') {
      return <CheckCircle color="success" />;
    } else if (status === 'invalid') {
      return <ErrorIcon color="error" />;
    }
    
    return null;
  };

  const hasAnyValidKey = validationStatus.googleAI === 'valid' || 
                         validationStatus.openAI === 'valid' || 
                         validationStatus.mapbox === 'valid';

  return (
    <Dialog 
      open={open} 
      onClose={required ? undefined : onClose}
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={required}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">API Key Configuration</Typography>
          {!required && (
            <Chip 
              label="Optional" 
              size="small" 
              color="info" 
              variant="outlined"
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2">
            Configure your API keys to enable AI features and map functionality. 
            Keys are stored securely in your browser session and never sent to our servers.
          </Typography>
        </Alert>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Google AI" />
          <Tab label="OpenAI" />
          <Tab label="Mapbox" />
        </Tabs>

        {/* Google AI Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Google Gemini API Key
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Get your API key from{' '}
              <Link href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener">
                Google AI Studio
              </Link>
              . Free tier includes 20 requests per day.
            </Typography>

            <TextField
              fullWidth
              label="API Key"
              type={showKeys.googleAI ? 'text' : 'password'}
              value={localKeys.googleAI}
              onChange={(e) => handleLocalKeyChange('googleAI', e.target.value)}
              placeholder="AIza..."
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {getValidationIcon('googleAI')}
                    <IconButton onClick={() => toggleShowKey('googleAI')} edge="end">
                      {showKeys.googleAI ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Model"
              value={localKeys.googleAIModel}
              onChange={(e) => handleLocalKeyChange('googleAIModel', e.target.value)}
              placeholder="gemini-2.5-flash"
              sx={{ mb: 2 }}
              helperText="Default: gemini-2.5-flash"
            />

            {validationErrors.googleAI && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {validationErrors.googleAI}
              </Alert>
            )}

            {validationStatus.googleAI === 'valid' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                API key is valid and ready to use!
              </Alert>
            )}

            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={() => handleValidate('googleAI')}
                disabled={!localKeys.googleAI || validationStatus.googleAI === 'validating'}
              >
                {validationStatus.googleAI === 'validating' ? 'Validating...' : 'Validate Key'}
              </Button>
              {localKeys.googleAI && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleClearKey('googleAI')}
                >
                  Clear
                </Button>
              )}
            </Box>
          </Box>
        </TabPanel>

        {/* OpenAI Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              OpenAI API Key
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Get your API key from{' '}
              <Link href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">
                OpenAI Platform
              </Link>
              . Requires a paid account.
            </Typography>

            <TextField
              fullWidth
              label="API Key"
              type={showKeys.openAI ? 'text' : 'password'}
              value={localKeys.openAI}
              onChange={(e) => handleLocalKeyChange('openAI', e.target.value)}
              placeholder="sk-..."
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {getValidationIcon('openAI')}
                    <IconButton onClick={() => toggleShowKey('openAI')} edge="end">
                      {showKeys.openAI ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {validationErrors.openAI && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {validationErrors.openAI}
              </Alert>
            )}

            {validationStatus.openAI === 'valid' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                API key is valid and ready to use!
              </Alert>
            )}

            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={() => handleValidate('openAI')}
                disabled={!localKeys.openAI || validationStatus.openAI === 'validating'}
              >
                {validationStatus.openAI === 'validating' ? 'Validating...' : 'Validate Key'}
              </Button>
              {localKeys.openAI && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleClearKey('openAI')}
                >
                  Clear
                </Button>
              )}
            </Box>
          </Box>
        </TabPanel>

        {/* Mapbox Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Mapbox Access Token
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Get your access token from{' '}
              <Link href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener">
                Mapbox Account
              </Link>
              . Free tier includes 50,000 map loads per month.
            </Typography>

            <TextField
              fullWidth
              label="Access Token"
              type={showKeys.mapbox ? 'text' : 'password'}
              value={localKeys.mapbox}
              onChange={(e) => handleLocalKeyChange('mapbox', e.target.value)}
              placeholder="pk...."
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {getValidationIcon('mapbox')}
                    <IconButton onClick={() => toggleShowKey('mapbox')} edge="end">
                      {showKeys.mapbox ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {validationErrors.mapbox && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {validationErrors.mapbox}
              </Alert>
            )}

            {validationStatus.mapbox === 'valid' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Access token is valid and ready to use!
              </Alert>
            )}

            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={() => handleValidate('mapbox')}
                disabled={!localKeys.mapbox || validationStatus.mapbox === 'validating'}
              >
                {validationStatus.mapbox === 'validating' ? 'Validating...' : 'Validate Token'}
              </Button>
              {localKeys.mapbox && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleClearKey('mapbox')}
                >
                  Clear
                </Button>
              )}
            </Box>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        {!required && (
          <Button onClick={handleSkip} color="inherit">
            Skip for Now
          </Button>
        )}
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={!hasAnyValidKey}
        >
          Save & Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}
