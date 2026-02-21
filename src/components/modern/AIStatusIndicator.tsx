import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { styled, keyframes } from '@mui/material/styles';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CircleIcon from '@mui/icons-material/Circle';

export type AIStatus = 'ready' | 'thinking' | 'offline' | 'error';

interface AIStatusIndicatorProps {
  status: AIStatus;
  compact?: boolean;
  showIcon?: boolean;
}

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

const StatusDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: AIStatus }>(({ theme, status }) => {
  const colors = {
    ready: theme.palette.success.main,
    thinking: theme.palette.primary.main,
    offline: theme.palette.grey[400],
    error: theme.palette.error.main,
  };

  return {
    position: 'relative',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: colors[status],
    animation: status === 'thinking' ? `${pulse} 1.5s ease-in-out infinite` : 'none',
    
    // Ripple effect for thinking state
    '&::before': status === 'thinking' ? {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      backgroundColor: colors[status],
      animation: `${ripple} 1.5s ease-out infinite`,
    } : {},
  };
});

const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: AIStatus }>(({ theme, status }) => {
  const colors = {
    ready: {
      bg: theme.palette.success.main,
      text: theme.palette.success.contrastText,
    },
    thinking: {
      bg: theme.palette.primary.main,
      text: theme.palette.primary.contrastText,
    },
    offline: {
      bg: theme.palette.grey[400],
      text: theme.palette.grey[900],
    },
    error: {
      bg: theme.palette.error.main,
      text: theme.palette.error.contrastText,
    },
  };

  const color = colors[status];

  return {
    background: `${color.bg}15`,
    color: color.bg,
    border: `1px solid ${color.bg}30`,
    fontWeight: 600,
    fontSize: '0.75rem',
    height: 28,
    backdropFilter: 'blur(8px)',
    transition: 'all 0.3s ease',
    
    '& .MuiChip-icon': {
      color: color.bg,
      animation: status === 'thinking' ? `${pulse} 1.5s ease-in-out infinite` : 'none',
    },
  };
});

export const AIStatusIndicator: React.FC<AIStatusIndicatorProps> = ({
  status,
  compact = false,
  showIcon = true,
}) => {
  const statusConfig = useMemo(() => {
    const configs = {
      ready: {
        label: 'AI Ready',
        ariaLabel: 'AI is ready and available',
        icon: <PsychologyIcon fontSize="small" />,
      },
      thinking: {
        label: 'AI Thinking...',
        ariaLabel: 'AI is processing your request',
        icon: <PsychologyIcon fontSize="small" />,
      },
      offline: {
        label: 'AI Offline',
        ariaLabel: 'AI is currently offline',
        icon: <PsychologyIcon fontSize="small" />,
      },
      error: {
        label: 'AI Error',
        ariaLabel: 'AI encountered an error',
        icon: <PsychologyIcon fontSize="small" />,
      },
    };
    return configs[status];
  }, [status]);

  if (compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
        role="status"
        aria-label={statusConfig.ariaLabel}
      >
        <StatusDot status={status} />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            color: 'text.secondary',
          }}
        >
          {statusConfig.label}
        </Typography>
      </Box>
    );
  }

  return (
    <StyledChip
      icon={showIcon ? statusConfig.icon : <StatusDot status={status} />}
      label={statusConfig.label}
      size="small"
      status={status}
      role="status"
      aria-label={statusConfig.ariaLabel}
    />
  );
};

export default AIStatusIndicator;
