import { Container } from '@mui/material';
import type { ContainerProps } from '@mui/material';
import { CONTENT_MAX_WIDTH } from '../../utils/layout';

/**
 * PageContainer - Consistent container for page content
 */
const PageContainer = ({ 
  children, 
  maxWidth = 'xl' as ContainerProps['maxWidth'], 
  disablePadding = false,
  sx = {} 
}: {
  children: React.ReactNode;
  maxWidth?: ContainerProps['maxWidth'];
  disablePadding?: boolean;
  sx?: object;
}) => {
  return (
    <Container 
      maxWidth={maxWidth}
      sx={{
        py: disablePadding ? 0 : { xs: 2, sm: 3 },
        px: disablePadding ? 0 : { xs: 2, sm: 3 },
        ...sx
      }}
    >
      {children}
    </Container>
  );
};

export default PageContainer;
