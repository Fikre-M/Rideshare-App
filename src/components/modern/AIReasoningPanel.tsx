import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { OptimizedMotion, animationVariants } from '../common/OptimizedMotion';
import { GlassCard } from './GlassCard';

interface AIReasoningPanelProps {
  reasoning: string | string[];
  title?: string;
  defaultExpanded?: boolean;
  variant?: 'default' | 'compact';
}

const ExpandButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded: boolean }>(({ theme, expanded }) => ({
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const ReasoningText = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  lineHeight: 1.7,
  color: theme.palette.text.secondary,
  
  '& strong': {
    color: theme.palette.text.primary,
    fontWeight: 600,
  },
  
  '& code': {
    background: theme.palette.action.hover,
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: '0.85em',
    fontFamily: 'monospace',
  },
}));

const ReasoningList = styled('ul')(({ theme }) => ({
  margin: 0,
  paddingLeft: theme.spacing(2.5),
  
  '& li': {
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    lineHeight: 1.7,
    
    '&:last-child': {
      marginBottom: 0,
    },
  },
}));

export const AIReasoningPanel: React.FC<AIReasoningPanelProps> = ({
  reasoning,
  title = 'Why did AI decide this?',
  defaultExpanded = false,
  variant = 'default',
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const reasoningArray = Array.isArray(reasoning) ? reasoning : [reasoning];

  if (variant === 'compact') {
    return (
      <Box sx={{ mt: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            userSelect: 'none',
            py: 1,
            px: 1.5,
            borderRadius: 1,
            transition: 'background 0.2s',
            '&:hover': {
              background: 'rgba(0, 0, 0, 0.04)',
            },
          }}
          onClick={handleToggle}
          role="button"
          aria-expanded={expanded}
          aria-label="Toggle AI reasoning"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggle();
            }
          }}
        >
          <PsychologyIcon fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight={600} color="primary" sx={{ flex: 1 }}>
            {title}
          </Typography>
          <ExpandButton
            expanded={expanded}
            size="small"
            aria-label="expand reasoning"
          >
            <ExpandMoreIcon fontSize="small" />
          </ExpandButton>
        </Box>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 4, pr: 1.5, py: 1.5 }}>
            {reasoningArray.length === 1 ? (
              <ReasoningText>{reasoningArray[0]}</ReasoningText>
            ) : (
              <ReasoningList>
                {reasoningArray.map((item, index) => (
                  <OptimizedMotion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {item}
                  </OptimizedMotion.li>
                ))}
              </ReasoningList>
            )}
          </Box>
        </Collapse>
      </Box>
    );
  }

  return (
    <OptimizedMotion.div
      initial={animationVariants.fadeIn.initial}
      animate={animationVariants.fadeIn.animate}
    >
      <GlassCard variant="subtle" sx={{ mt: 2, overflow: 'visible' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={handleToggle}
          role="button"
          aria-expanded={expanded}
          aria-label="Toggle AI reasoning"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggle();
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: (theme) => `${theme.palette.primary.main}15`,
            }}
          >
            <PsychologyIcon color="primary" />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {expanded ? 'Click to hide' : 'Click to see AI reasoning'}
            </Typography>
          </Box>
          
          <ExpandButton
            expanded={expanded}
            aria-label="expand reasoning"
          >
            <ExpandMoreIcon />
          </ExpandButton>
        </Box>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider />
          <Box sx={{ p: 2.5 }}>
            {reasoningArray.length === 1 ? (
              <ReasoningText>{reasoningArray[0]}</ReasoningText>
            ) : (
              <ReasoningList>
                {reasoningArray.map((item, index) => (
                  <OptimizedMotion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {item}
                  </OptimizedMotion.li>
                ))}
              </ReasoningList>
            )}
          </Box>
        </Collapse>
      </GlassCard>
    </OptimizedMotion.div>
  );
};

export default AIReasoningPanel;
