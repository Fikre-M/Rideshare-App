import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import { GlassCard } from './GlassCard';

const AnimatedSkeleton = styled(Skeleton)(({ theme }) => ({
  background: `linear-gradient(90deg, 
    ${theme.palette.action.hover} 0%, 
    ${theme.palette.action.selected} 50%, 
    ${theme.palette.action.hover} 100%)`,
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s ease-in-out infinite',
  
  '@keyframes shimmer': {
    '0%': {
      backgroundPosition: '200% 0',
    },
    '100%': {
      backgroundPosition: '-200% 0',
    },
  },
}));

export const SmartMatchingSkeleton = () => (
  <GlassCard variant="elevated" sx={{ p: 3 }}>
    {/* Header */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <AnimatedSkeleton variant="circular" width={56} height={56} />
      <Box sx={{ flex: 1 }}>
        <AnimatedSkeleton variant="text" width="40%" height={32} />
        <AnimatedSkeleton variant="text" width="60%" height={20} />
      </Box>
    </Box>
    
    {/* Form */}
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
        <AnimatedSkeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
        <AnimatedSkeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
        <AnimatedSkeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
    
    {/* Results */}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 2 }}>
      <AnimatedSkeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      <AnimatedSkeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      <AnimatedSkeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
    </Box>
    
    {/* Match Card */}
    <AnimatedSkeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
  </GlassCard>
);

export const DynamicPricingSkeleton = () => (
  <GlassCard variant="elevated" sx={{ p: 3 }}>
    {/* Header */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <AnimatedSkeleton variant="circular" width={56} height={56} />
      <Box sx={{ flex: 1 }}>
        <AnimatedSkeleton variant="text" width="50%" height={32} />
        <AnimatedSkeleton variant="text" width="70%" height={20} />
      </Box>
    </Box>
    
    {/* Price Display */}
    <Box sx={{ textAlign: 'center', mb: 3 }}>
      <AnimatedSkeleton variant="text" width="30%" height={64} sx={{ mx: 'auto' }} />
      <AnimatedSkeleton variant="text" width="40%" height={24} sx={{ mx: 'auto' }} />
    </Box>
    
    {/* Factors */}
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mb: 3 }}>
      {[1, 2, 3, 4].map((i) => (
        <Box key={i}>
          <AnimatedSkeleton variant="text" width="60%" height={20} />
          <AnimatedSkeleton variant="text" width="80%" height={32} />
        </Box>
      ))}
    </Box>
    
    {/* Chart */}
    <AnimatedSkeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
  </GlassCard>
);

export const RouteOptimizerSkeleton = () => (
  <GlassCard variant="elevated" sx={{ p: 3 }}>
    {/* Header */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <AnimatedSkeleton variant="circular" width={56} height={56} />
      <Box sx={{ flex: 1 }}>
        <AnimatedSkeleton variant="text" width="45%" height={32} />
        <AnimatedSkeleton variant="text" width="65%" height={20} />
      </Box>
    </Box>
    
    {/* Route Cards */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[1, 2, 3].map((i) => (
        <AnimatedSkeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      ))}
    </Box>
  </GlassCard>
);

export const PredictiveAnalyticsSkeleton = () => (
  <GlassCard variant="elevated" sx={{ p: 3 }}>
    {/* Header */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <AnimatedSkeleton variant="circular" width={56} height={56} />
      <Box sx={{ flex: 1 }}>
        <AnimatedSkeleton variant="text" width="55%" height={32} />
        <AnimatedSkeleton variant="text" width="75%" height={20} />
      </Box>
    </Box>
    
    {/* KPI Cards */}
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
      {[1, 2, 3, 4].map((i) => (
        <AnimatedSkeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
      ))}
    </Box>
    
    {/* Charts */}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <AnimatedSkeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      <AnimatedSkeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
    </Box>
  </GlassCard>
);

export const ChatBotSkeleton = () => (
  <GlassCard variant="elevated" sx={{ p: 2 }}>
    {/* Messages */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
      {/* User message */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <AnimatedSkeleton variant="rectangular" width="70%" height={60} sx={{ borderRadius: 2 }} />
      </Box>
      
      {/* AI message */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <AnimatedSkeleton variant="circular" width={32} height={32} />
        <AnimatedSkeleton variant="rectangular" width="80%" height={80} sx={{ borderRadius: 2 }} />
      </Box>
    </Box>
    
    {/* Input */}
    <AnimatedSkeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
  </GlassCard>
);

export const GenericAISkeleton = () => (
  <GlassCard variant="elevated" sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      <AnimatedSkeleton variant="circular" width={48} height={48} />
      <Box sx={{ flex: 1 }}>
        <AnimatedSkeleton variant="text" width="40%" height={28} />
        <AnimatedSkeleton variant="text" width="60%" height={20} />
      </Box>
    </Box>
    
    <AnimatedSkeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
    
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      <AnimatedSkeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
      <AnimatedSkeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
    </Box>
  </GlassCard>
);

export default {
  SmartMatchingSkeleton,
  DynamicPricingSkeleton,
  RouteOptimizerSkeleton,
  PredictiveAnalyticsSkeleton,
  ChatBotSkeleton,
  GenericAISkeleton,
};
