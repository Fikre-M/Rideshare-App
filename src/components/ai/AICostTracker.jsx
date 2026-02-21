import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import { 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useBudgetStore } from '../../services/aiBudgetGuard';

const TrackerContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  left: theme.spacing(2),
  width: 320,
  maxWidth: '90vw',
  zIndex: 1300,
  boxShadow: theme.shadows[8],
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
}));

const TrackerHeader = styled(Box)(({ theme, exceeded }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 2),
  background: exceeded 
    ? theme.palette.error.main 
    : theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  cursor: 'pointer',
  userSelect: 'none',
}));

const TrackerContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const FeatureRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0.5, 0),
  fontSize: '0.875rem',
}));

const AICostTracker = ({ collapsed: initialCollapsed = true }) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  
  const {
    sessionCost,
    sessionTokens,
    costByFeature,
    budgetLimit,
    budgetEnabled,
    budgetExceeded,
    resetSession,
    getRemainingBudget,
    getBudgetPercentage,
  } = useBudgetStore();
  
  const remainingBudget = getRemainingBudget();
  const budgetPercentage = getBudgetPercentage();
  
  const getStatusColor = () => {
    if (budgetExceeded) return 'error';
    if (budgetPercentage >= 80) return 'warning';
    return 'success';
  };
  
  const getStatusIcon = () => {
    if (budgetExceeded) return <WarningIcon fontSize="small" />;
    if (budgetPercentage >= 80) return <WarningIcon fontSize="small" />;
    return <CheckIcon fontSize="small" />;
  };
  
  const formatCost = (cost) => `$${cost.toFixed(4)}`;
  const formatTokens = (tokens) => {
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };
  
  const handleReset = (e) => {
    e.stopPropagation();
    if (window.confirm('Reset AI cost tracking for this session?')) {
      resetSession();
    }
  };
  
  return (
    <TrackerContainer elevation={8}>
      <TrackerHeader 
        exceeded={budgetExceeded}
        onClick={() => setCollapsed(!collapsed)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MoneyIcon fontSize="small" />
          <Typography variant="subtitle2" fontWeight={600}>
            AI Cost Tracker
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" fontWeight={700}>
            {formatCost(sessionCost)}
          </Typography>
          <IconButton 
            size="small" 
            sx={{ color: 'inherit' }}
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(!collapsed);
            }}
          >
            {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Box>
      </TrackerHeader>
      
      <Collapse in={!collapsed}>
        <TrackerContent>
          {/* Budget Status */}
          {budgetEnabled && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Budget Status
                </Typography>
                <Chip 
                  icon={getStatusIcon()}
                  label={budgetExceeded ? 'Exceeded' : `${budgetPercentage.toFixed(0)}%`}
                  size="small"
                  color={getStatusColor()}
                  sx={{ height: 20 }}
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(budgetPercentage, 100)}
                color={getStatusColor()}
                sx={{ height: 8, borderRadius: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatCost(sessionCost)} / {formatCost(budgetLimit)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatCost(remainingBudget)} left
                </Typography>
              </Box>
            </Box>
          )}
          
          {budgetExceeded && (
            <Box 
              sx={{ 
                p: 1.5, 
                mb: 2, 
                bgcolor: 'error.light', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <WarningIcon color="error" fontSize="small" />
              <Typography variant="caption" color="error.dark">
                Budget limit reached. AI features are paused.
              </Typography>
            </Box>
          )}
          
          {/* Token Usage */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Token Usage
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`Input: ${formatTokens(sessionTokens.input)}`}
                size="small"
                variant="outlined"
              />
              <Chip 
                label={`Output: ${formatTokens(sessionTokens.output)}`}
                size="small"
                variant="outlined"
              />
              <Chip 
                label={`Total: ${formatTokens(sessionTokens.total)}`}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
          
          {/* Cost by Feature */}
          {Object.keys(costByFeature).length > 0 && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Cost by Feature
                </Typography>
                {Object.entries(costByFeature)
                  .sort(([, a], [, b]) => b - a)
                  .map(([feature, cost]) => (
                    <FeatureRow key={feature}>
                      <Typography variant="caption" color="text.secondary">
                        {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {formatCost(cost)}
                      </Typography>
                    </FeatureRow>
                  ))}
              </Box>
            </>
          )}
          
          {/* Actions */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="Reset session tracking">
              <IconButton 
                size="small" 
                onClick={handleReset}
                disabled={sessionCost === 0}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </TrackerContent>
      </Collapse>
    </TrackerContainer>
  );
};

export default AICostTracker;
