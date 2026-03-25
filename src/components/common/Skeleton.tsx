// @ts-nocheck
import React from 'react';
import { Skeleton as MuiSkeleton, Box } from '@mui/material';

/**
 * Skeleton component for loading states
 * @param {Object} props - Component props
 * @param {string} [props.variant='text'] - Skeleton variant (text, circular, rectangular)
 * @param {number} [props.width='100%'] - Width of the skeleton
 * @param {number} [props.height=24] - Height of the skeleton
 * @param {number} [props.count=1] - Number of skeleton items to render
 * @param {string} [props.animation='pulse'] - Animation type (pulse, wave, false)
 * @param {string} [props.className] - Additional CSS class
 * @param {Object} [props.sx] - Additional styles
 * @returns {JSX.Element} Skeleton component
 */
const Skeleton = ({
  variant = 'text',
  width = '100%',
  height = 24,
  count = 1,
  animation = 'pulse',
  className = '',
  sx = {},
  ...rest
}) => {
  const skeletons = Array.from({ length: count }).map((_, index) => (
    <Box
      key={index}
      sx={{
        width: '100%',
        '&:not(:last-child)': {
          mb: 1,
        },
        ...sx,
      }}
    >
      <MuiSkeleton
        variant={variant}
        width={width}
        height={height}
        animation={animation}
        className={className}
        {...rest}
      />
    </Box>
  ));

  return <>{skeletons}</>;
};

export default Skeleton;
