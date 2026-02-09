import { Box, Typography, Paper } from '@mui/material';

/**
 * PageSection - Reusable section container with optional title
 * @param {Object} props
 * @param {React.ReactNode} props.children - Section content
 * @param {string} [props.title] - Section title
 * @param {React.ReactNode} [props.actions] - Action buttons for section header
 * @param {boolean} [props.paper=false] - Wrap in Paper component
 * @param {Object} [props.sx={}] - Additional MUI sx styles
 */
const PageSection = ({ 
  children, 
  title, 
  actions,
  paper = false,
  sx = {} 
}) => {
  const content = (
    <Box sx={sx}>
      {(title || actions) && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2,
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          {title && (
            <Typography 
              variant="h6" 
              component="h2"
              sx={{ fontWeight: 600 }}
            >
              {title}
            </Typography>
          )}
          {actions && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {actions}
            </Box>
          )}
        </Box>
      )}
      {children}
    </Box>
  );

  if (paper) {
    return (
      <Paper 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          ...sx 
        }}
      >
        {content}
      </Paper>
    );
  }

  return content;
};

export default PageSection;
