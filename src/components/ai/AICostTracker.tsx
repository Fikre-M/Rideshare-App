// @ts-nocheck
import { useState, useRef, useCallback } from 'react';
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
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useBudgetStore } from '../../services/aiBudgetGuard';

const TrackerContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  width: 260,
  maxWidth: '90vw',
  zIndex: 1300,
  boxShadow: theme.shadows[8],
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  userSelect: 'none',
}));

const TrackerHeader = styled(Box)(({ theme, exceeded }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 1.5),
  background: exceeded 
    ? theme.palette.error.main 
    : theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  cursor: 'grab',
  '&:active': { cursor: 'grabbing' },
}));

const TrackerContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
}));

const FeatureRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0.25, 0),
  fontSize: '0.8rem',
}));

const AICostTracker = ({ collapsed: initialCollapsed = true }) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [pos, setPos] = useState({ bottom: 16, left: 16, top: null, right: null });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, elLeft: 0, elTop: 0 });
  const containerRef = useRef(null);

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
    if (budgetExceeded || budgetPercentage >= 80) return <WarningIcon fontSize="small" />;
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

  const onMouseDown = useCallback((e) => {
    // only drag on the header itself, not on icon buttons
    if (e.target.closest('button')) return;
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, elLeft: rect.left, elTop: rect.top };

    const onMouseMove = (me) => {
      if (!dragging.current) return;
      const dx = me.clientX - dragStart.current.x;
      const dy = me.clientY - dragStart.current.y;
      const newLeft = Math.max(0, Math.min(window.innerWidth - rect.width, dragStart.current.elLeft + dx));
      const newTop = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, dragStart.current.elTop + dy));
      setPos({ left: newLeft, top: newTop, bottom: null, right: null });
    };

    const onMouseUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  const containerStyle = {
    left: pos.left,
    top: pos.top ?? undefined,
    bottom: pos.bottom ?? undefined,
    right: pos.right ?? undefined,
  };

  return (
    <TrackerContainer ref={containerRef} elevation={8} style={containerStyle}>
      <TrackerHeader exceeded={budgetExceeded} onMouseDown={onMouseDown}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <DragIcon fontSize="small" sx={{ opacity: 0.7, fontSize: 16 }} />
          <MoneyIcon fontSize="small" sx={{ fontSize: 16 }} />
          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
            AI Cost Tracker
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" fontWeight={700}>
            {formatCost(sessionCost)}
          </Typography>
          <IconButton
            size="small"
            sx={{ color: 'inherit', p: 0.25 }}
            onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
          >
            {collapsed ? <ExpandMoreIcon sx={{ fontSize: 18 }} /> : <ExpandLessIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Box>
      </TrackerHeader>
      
      <Collapse in={!collapsed}>
        <TrackerContent>
          {budgetEnabled && (
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Budget</Typography>
                <Chip 
                  icon={getStatusIcon()}
                  label={budgetExceeded ? 'Exceeded' : `${budgetPercentage.toFixed(0)}%`}
                  size="small"
                  color={getStatusColor()}
                  sx={{ height: 18, fontSize: '0.7rem' }}
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(budgetPercentage, 100)}
                color={getStatusColor()}
                sx={{ height: 6, borderRadius: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {formatCost(sessionCost)} / {formatCost(budgetLimit)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {formatCost(remainingBudget)} left
                </Typography>
              </Box>
            </Box>
          )}
          
          {budgetExceeded && (
            <Box sx={{ p: 1, mb: 1.5, bgcolor: 'error.light', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <WarningIcon color="error" sx={{ fontSize: 14 }} />
              <Typography variant="caption" color="error.dark" sx={{ fontSize: '0.7rem' }}>
                Budget limit reached. AI features paused.
              </Typography>
            </Box>
          )}
          
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
              Tokens
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {[
                `In: ${formatTokens(sessionTokens.input)}`,
                `Out: ${formatTokens(sessionTokens.output)}`,
                `Total: ${formatTokens(sessionTokens.total)}`,
              ].map((label) => (
                <Chip key={label} label={label} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.68rem' }} />
              ))}
            </Box>
          </Box>
          
          {Object.keys(costByFeature).length > 0 && (
            <>
              <Divider sx={{ my: 1 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontSize: '0.7rem' }}>
                  By Feature
                </Typography>
                {Object.entries(costByFeature)
                  .sort(([, a], [, b]) => b - a)
                  .map(([feature, cost]) => (
                    <FeatureRow key={feature}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                        {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                      <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.72rem' }}>
                        {formatCost(cost)}
                      </Typography>
                    </FeatureRow>
                  ))}
              </Box>
            </>
          )}
          
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="Reset session tracking">
              <span>
                <IconButton size="small" onClick={handleReset} disabled={sessionCost === 0}>
                  <RefreshIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </TrackerContent>
      </Collapse>
    </TrackerContainer>
  );
};

export default AICostTracker;
