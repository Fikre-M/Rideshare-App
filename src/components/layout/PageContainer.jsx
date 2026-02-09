import { Container } from '@mui/material';
import { CONTENT_MAX_WIDTH } from '../../constants/layout';

/**
 * PageContainer - Consistent container for page content
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} [props.maxWidth='xl'] - Max width constraint (xs, sm, md, lg, xl, or false)
 * @param {boolean} [props.disablePadding=false] - Remove default padding
 * @param {Object} [props.sx={}] - Additional MUI sx styles
 */
const PageContainer = ({ 
  children, 
  maxWidth = 'xl', 
  disablePadding = false,
  sx = {} 
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
