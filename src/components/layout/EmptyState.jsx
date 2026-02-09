import { Box, Typography } from '@mui/material';
import { 
  Inbox as InboxIcon 
} from '@mui/icons-material';

/**
 * EmptyState - Display when no data is available
 * @param {Object} props
 * @param {React.Component} [props.icon] - MUI Icon component
 * @param {string} props.title - Empty state title
 * @param {string} [props.description] - Empty state description
 * @param {React.ReactNode} [props.action] - Call-to-action button
 * @param {Object} [props.sx={}] - Additional MUI sx styles
 */
const EmptyState = ({ 
  icon: Icon = InboxIcon, 
  title, 
  description, 
  action,
  sx = {}
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center',
        ...sx
      }}
    >
      <Icon 
        sx={{ 
          fontSize: 64, 
          color: 'text.disabled', 
          mb: 2,
          opacity: 0.5
        }} 
      />
      
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        {title}
      </Typography>
      
      {description && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 3, 
            maxWidth: 400,
            lineHeight: 1.6
          }}
        >
          {description}
        </Typography>
      )}
      
      {action}
    </Box>
  );
};

export default EmptyState;
