// @ts-nocheck
import React from 'react';
import Skeleton from './Skeleton';
import { Box } from '@mui/material';

/**
 * SkeletonLoader component for displaying skeleton loading states
 * @param {Object} props - Component props
 * @param {string} [props.type='text'] - Type of skeleton to display ('text', 'card', 'list', 'table', 'map')
 * @param {number} [props.count=1] - Number of skeleton items to render
 * @param {Object} [props.sx] - Additional styles
 * @returns {JSX.Element} Skeleton loader component
 */
const SkeletonLoader = ({ type = 'text', count = 1, sx = {} }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <Box sx={{ p: 2, ...sx }}>
            <Skeleton variant="rectangular" width="100%" height={140} />
            <Box sx={{ pt: 2 }}>
              <Skeleton width="60%" height={24} />
              <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
              <Skeleton width="80%" height={20} sx={{ mt: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Skeleton width={100} height={36} />
                <Skeleton width={100} height={36} />
              </Box>
            </Box>
          </Box>
        );
      
      case 'list':
        return (
          <Box sx={{ width: '100%', ...sx }}>
            {[...Array(count)].map((_, index) => (
              <Box key={index} sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Skeleton width="70%" height={20} />
                <Skeleton width="50%" height={16} sx={{ mt: 1 }} />
                <Skeleton width="30%" height={16} sx={{ mt: 0.5 }} />
              </Box>
            ))}
          </Box>
        );

      case 'table':
        return (
          <Box sx={{ width: '100%', ...sx }}>
            {/* Table header */}
            <Box sx={{ display: 'flex', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={`header-${i}`} width={i % 2 === 0 ? '25%' : '15%'} height={24} sx={{ mr: 2 }} />
              ))}
            </Box>
            
            {/* Table rows */}
            {[...Array(count)].map((_, rowIndex) => (
              <Box 
                key={`row-${rowIndex}`} 
                sx={{ 
                  display: 'flex', 
                  p: 2, 
                  borderBottom: '1px solid', 
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' }
                }}
              >
                {[...Array(4)].map((_, cellIndex) => (
                  <Skeleton 
                    key={`cell-${rowIndex}-${cellIndex}`} 
                    width={cellIndex % 2 === 0 ? '25%' : '15%'} 
                    height={20} 
                    sx={{ mr: 2 }} 
                  />
                ))}
              </Box>
            ))}
          </Box>
        );

      case 'map':
        return (
          <Box sx={{ width: '100%', height: 400, position: 'relative', ...sx }}>
            <Skeleton variant="rectangular" width="100%" height="100%" />
            <Box 
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                width: '100%',
                p: 2
              }}
            >
              <Skeleton width={200} height={24} sx={{ mx: 'auto' }} />
              <Skeleton width={300} height={20} sx={{ mt: 1, mx: 'auto' }} />
            </Box>
          </Box>
        );

      case 'text':
      default:
        return (
          <Box sx={{ width: '100%', ...sx }}>
            {[...Array(count)].map((_, index) => (
              <Skeleton 
                key={index} 
                width={index % 3 === 0 ? '100%' : index % 2 === 0 ? '80%' : '60%'}
                height={20}
                sx={{ 
                  mt: index === 0 ? 0 : 1,
                  borderRadius: 1
                }}
              />
            ))}
          </Box>
        );
    }
  };

  return <>{renderSkeleton()}</>;
};

export default React.memo(SkeletonLoader);
