import { Box, Typography, Breadcrumbs } from '@mui/material';

/**
 * PageHeader - Consistent header for pages with title, subtitle, and actions
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} [props.subtitle] - Optional subtitle/description
 * @param {React.ReactNode} [props.actions] - Action buttons (e.g., "Add New", "Export")
 * @param {React.ReactNode} [props.breadcrumbs] - Breadcrumb navigation
 * @param {Object} [props.sx={}] - Additional MUI sx styles
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  actions, 
  breadcrumbs,
  sx = {} 
}) => {
  return (
    <Box sx={{ mb: 3, ...sx }}>
      {breadcrumbs && (
        <Breadcrumbs sx={{ mb: 1 }}>
          {breadcrumbs}
        </Breadcrumbs>
      )}
      
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              wordBreak: 'break-word'
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {actions && (
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 1,
              flexShrink: 0
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
