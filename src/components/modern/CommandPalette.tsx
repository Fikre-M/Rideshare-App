import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import Dialog from '@mui/material/Dialog';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import {
  Dashboard as DashboardIcon,
  Map as MapIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Psychology as AIIcon,
  DirectionsCar as CarIcon,
  AttachMoney as PriceIcon,
  Route as RouteIcon,
  TrendingUp as TrendIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onAICommand?: (command: string) => void;
}

const StyledCommand = styled(Command)(({ theme }) => ({
  width: '100%',
  maxWidth: 640,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px) saturate(180%)',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 16px 70px rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  overflow: 'hidden',
  fontFamily: theme.typography.fontFamily,
  
  [theme.palette.mode === 'dark' && theme.breakpoints.up('sm')]: {
    background: 'rgba(30, 30, 30, 0.95)',
  },
}));

const StyledInput = styled(Command.Input)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(2, 3),
  fontSize: '1rem',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: theme.palette.text.primary,
  fontFamily: theme.typography.fontFamily,
  
  '&::placeholder': {
    color: theme.palette.text.secondary,
  },
}));

const StyledList = styled(Command.List)(({ theme }) => ({
  maxHeight: 400,
  overflow: 'auto',
  padding: theme.spacing(1),
  
  '&::-webkit-scrollbar': {
    width: 8,
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.divider,
    borderRadius: 4,
  },
}));

const StyledItem = styled(Command.Item)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'all 0.15s ease',
  
  '&[data-selected="true"]': {
    background: `${theme.palette.primary.main}15`,
    color: theme.palette.primary.main,
    
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  
  '&:active': {
    transform: 'scale(0.98)',
  },
}));

const StyledGroup = styled(Command.Group)(({ theme }) => ({
  '& [cmdk-group-heading]': {
    padding: theme.spacing(1.5, 2, 0.5),
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
}));

const StyledEmpty = styled(Command.Empty)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
}));

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  onAICommand,
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onClose]);

  const handleSelect = useCallback((callback: () => void) => {
    callback();
    onClose();
    setSearch('');
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          background: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
        },
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        },
      }}
    >
      <StyledCommand value={search} onValueChange={setSearch}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, pt: 2 }}>
          <SearchIcon color="action" />
          <StyledInput
            placeholder="Type a command or search..."
            autoFocus
          />
          <Chip
            label={navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
            size="small"
            sx={{ fontSize: '0.7rem', height: 24 }}
          />
        </Box>
        
        <StyledList>
          <StyledEmpty>No results found.</StyledEmpty>
          
          {/* Navigation Commands */}
          <StyledGroup heading="Navigation">
            <StyledItem onSelect={() => handleSelect(() => navigate('/dashboard'))}>
              <DashboardIcon fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">Dashboard</Typography>
              </Box>
              <Chip label="⌘D" size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
            </StyledItem>
            
            <StyledItem onSelect={() => handleSelect(() => navigate('/dashboard/map'))}>
              <MapIcon fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">Map View</Typography>
              </Box>
              <Chip label="⌘M" size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
            </StyledItem>
            
            <StyledItem onSelect={() => handleSelect(() => navigate('/dashboard/analytics'))}>
              <AnalyticsIcon fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">Analytics</Typography>
              </Box>
            </StyledItem>
            
            <StyledItem onSelect={() => handleSelect(() => navigate('/dashboard/settings'))}>
              <SettingsIcon fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">Settings</Typography>
              </Box>
            </StyledItem>
            
            <StyledItem onSelect={() => handleSelect(() => navigate('/dashboard/profile'))}>
              <PersonIcon fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">Profile</Typography>
              </Box>
            </StyledItem>
          </StyledGroup>
          
          {/* AI Features */}
          <StyledGroup heading="AI Features">
            <StyledItem onSelect={() => handleSelect(() => {
              navigate('/dashboard/ai-demo');
              if (onAICommand) onAICommand('smart-matching');
            })}>
              <CarIcon fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">Smart Driver Matching</Typography>
                <Typography variant="caption" color="text.secondary">
                  AI-powered driver-passenger matching
                </Typography>
              </Box>
            </StyledItem>
            
            <StyledItem onSelect={() => handleSelect(() => {
              navigate('/dashboard/ai-demo');
              if (onAICommand) onAICommand('dynamic-pricing');
            })}>
              <PriceIcon fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">Dynamic Pricing</Typography>
                <Typography variant="caption" color="text.secondary">
                  AI surge pricing calculator
                </Typography>
              </Box>
            </StyledItem>
            
            <StyledItem onSelect={() => handleSelect(() => {
              navigate('/dashboard/ai-demo');
              if (onAICommand) onAICommand('route-optimizer');
            })}>
              <RouteIcon fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">Route Optimization</Typography>
                <Typography variant="caption" color="text.secondary">
                  AI-optimized route planning
                </Typography>
              </Box>
            </StyledItem>
            
            <StyledItem onSelect={() => handleSelect(() => {
              navigate('/dashboard/ai-demo');
              if (onAICommand) onAICommand('predictive-analytics');
            })}>
              <TrendIcon fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">Predictive Analytics</Typography>
                <Typography variant="caption" color="text.secondary">
                  AI business forecasting
                </Typography>
              </Box>
            </StyledItem>
          </StyledGroup>
          
          {/* AI Assistant */}
          <StyledGroup heading="AI Assistant">
            <StyledItem onSelect={() => handleSelect(() => {
              if (onAICommand) onAICommand('chat');
            })}>
              <AIIcon fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">Ask AI Assistant</Typography>
                <Typography variant="caption" color="text.secondary">
                  Chat with AI about anything
                </Typography>
              </Box>
            </StyledItem>
          </StyledGroup>
        </StyledList>
      </StyledCommand>
    </Dialog>
  );
};

export default CommandPalette;
