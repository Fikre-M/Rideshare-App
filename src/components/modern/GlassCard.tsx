import { ReactNode, forwardRef } from 'react';
import { styled } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';

interface GlassCardProps extends BoxProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'subtle';
  blur?: 'light' | 'medium' | 'heavy';
  hover?: boolean;
}

const StyledGlassCard = styled(Box, {
  shouldForwardProp: (prop) => 
    !['variant', 'blur', 'hover'].includes(prop as string),
})<GlassCardProps>(({ theme, variant = 'default', blur = 'medium', hover = false }) => {
  const blurValues = {
    light: '8px',
    medium: '16px',
    heavy: '24px',
  };

  const variants = {
    default: {
      background: 'rgba(255, 255, 255, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    },
    elevated: {
      background: 'rgba(255, 255, 255, 0.85)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: '0 12px 48px 0 rgba(31, 38, 135, 0.2)',
    },
    subtle: {
      background: 'rgba(255, 255, 255, 0.5)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.1)',
    },
  };

  const variantStyles = variants[variant];

  return {
    position: 'relative',
    background: variantStyles.background,
    backdropFilter: `blur(${blurValues[blur]}) saturate(180%)`,
    WebkitBackdropFilter: `blur(${blurValues[blur]}) saturate(180%)`,
    borderRadius: theme.shape.borderRadius * 2,
    border: variantStyles.border,
    boxShadow: variantStyles.boxShadow,
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Dark mode support
    [theme.breakpoints.up('sm')]: {
      ...(theme.palette.mode === 'dark' && {
        background: 'rgba(30, 30, 30, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }),
    },

    // Hover effect
    ...(hover && {
      cursor: 'pointer',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 16px 64px 0 rgba(31, 38, 135, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
      },
    }),

    // Shimmer effect on hover
    '&::before': hover ? {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
      transition: 'left 0.5s',
    } : {},

    '&:hover::before': hover ? {
      left: '100%',
    } : {},
  };
});

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, variant = 'default', blur = 'medium', hover = false, ...props }, ref) => {
    return (
      <StyledGlassCard
        ref={ref}
        variant={variant}
        blur={blur}
        hover={hover}
        {...props}
      >
        {children}
      </StyledGlassCard>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;
