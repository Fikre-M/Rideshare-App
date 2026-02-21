import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { OptimizedMotion } from '../common/OptimizedMotion';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

interface AIConfidenceIndicatorProps {
  confidence: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  showLabel?: boolean;
  animated?: boolean;
}

const ConfidenceChip = styled(Chip)<{ confidenceLevel: 'high' | 'medium' | 'low' }>(
  ({ theme, confidenceLevel }) => {
    const colors = {
      high: {
        bg: theme.palette.success.main,
        text: theme.palette.success.contrastText,
      },
      medium: {
        bg: theme.palette.warning.main,
        text: theme.palette.warning.contrastText,
      },
      low: {
        bg: theme.palette.error.main,
        text: theme.palette.error.contrastText,
      },
    };

    const color = colors[confidenceLevel];

    return {
      background: `${color.bg}20`,
      color: color.bg,
      border: `1px solid ${color.bg}40`,
      fontWeight: 600,
      backdropFilter: 'blur(8px)',
      transition: 'all 0.3s ease',
      
      '&:hover': {
        background: `${color.bg}30`,
        transform: 'scale(1.05)',
      },

      '& .MuiChip-icon': {
        color: color.bg,
      },
    };
  }
);

export const AIConfidenceIndicator: React.FC<AIConfidenceIndicatorProps> = ({
  confidence,
  size = 'medium',
  showIcon = true,
  showLabel = true,
  animated = true,
}) => {
  const confidenceLevel = useMemo(() => {
    if (confidence >= 80) return 'high';
    if (confidence >= 60) return 'medium';
    return 'low';
  }, [confidence]);

  const icon = useMemo(() => {
    if (!showIcon) return undefined;
    
    switch (confidenceLevel) {
      case 'high':
        return <CheckCircleIcon fontSize={size} />;
      case 'medium':
        return <WarningIcon fontSize={size} />;
      case 'low':
        return <ErrorIcon fontSize={size} />;
    }
  }, [confidenceLevel, showIcon, size]);

  const tooltipText = useMemo(() => {
    const descriptions = {
      high: 'High confidence - AI is very certain about this result',
      medium: 'Medium confidence - AI has some uncertainty',
      low: 'Low confidence - AI suggests reviewing this result',
    };
    return descriptions[confidenceLevel];
  }, [confidenceLevel]);

  const label = showLabel ? `${confidence}% confident` : `${confidence}%`;

  const chipContent = (
    <ConfidenceChip
      icon={icon}
      label={label}
      size={size}
      confidenceLevel={confidenceLevel}
      aria-label={`AI confidence: ${confidence} percent`}
      role="status"
    />
  );

  if (animated) {
    return (
      <Tooltip title={tooltipText} arrow placement="top">
        <Box component="span">
          <OptimizedMotion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {chipContent}
          </OptimizedMotion.div>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltipText} arrow placement="top">
      {chipContent}
    </Tooltip>
  );
};

export default AIConfidenceIndicator;
