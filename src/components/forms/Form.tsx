// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Button, 
  Stack, 
  Typography, 
  CircularProgress,
  Alert,
  AlertTitle,
  Paper,
  useTheme,
} from '@mui/material';

/**
 * A reusable form component that handles form submission, validation, and error states.
 * Integrates with react-hook-form and provides consistent styling and behavior.
 */
const Form = ({
  children,
  onSubmit,
  submitLabel = 'Submit',
  cancelLabel,
  onCancel,
  loading = false,
  error,
  success,
  successMessage = 'Form submitted successfully!',
  showSuccess = true,
  showError = true,
  fullWidth = true,
  maxWidth = 'md',
  spacing = 2,
  submitButtonProps = {},
  cancelButtonProps = {},
  paperProps = {},
  sx = {},
  ...rest
}) => {
  const theme = useTheme();
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit && !loading) {
      onSubmit(e);
    }
  };
  
  // Handle cancel action
  const handleCancel = (e) => {
    if (onCancel) {
      onCancel(e);
    }
  };
  
  // Determine form width based on maxWidth prop
  const getFormWidth = () => {
    const widths = {
      xs: '100%',
      sm: '600px',
      md: '900px',
      lg: '1200px',
      xl: '1536px',
      false: '100%',
    };
    return widths[maxWidth] || maxWidth;
  };
  
  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: fullWidth ? '100%' : 'auto',
        maxWidth: getFormWidth(),
        mx: 'auto',
        ...sx,
      }}
      noValidate
      {...rest}
    >
      {/* Success Message */}
      {success && showSuccess && successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: spacing, borderRadius: 2 }}
        >
          <AlertTitle>Success</AlertTitle>
          {successMessage}
        </Alert>
      )}
      
      {/* Error Message */}
      {error && showError && (
        <Alert 
          severity="error" 
          sx={{ mb: spacing, borderRadius: 2 }}
        >
          <AlertTitle>Error</AlertTitle>
          {typeof error === 'string' ? error : 'An error occurred while submitting the form.'}
        </Alert>
      )}
      
      {/* Form Content */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          ...paperProps.sx,
        }}
        {...paperProps}
      >
        <Stack spacing={spacing}>
          {children}
          
          {/* Form Actions */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: 2,
              pt: 2,
              '& > *': {
                minWidth: 120,
              },
            }}
          >
            {onCancel && (
              <Button
                type="button"
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
                {...cancelButtonProps}
              >
                {cancelLabel || 'Cancel'}
              </Button>
            )}
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              {...submitButtonProps}
              sx={{
                '&.Mui-disabled': {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  opacity: 0.7,
                },
                ...submitButtonProps.sx,
              }}
            >
              {loading ? 'Submitting...' : submitLabel}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

Form.propTypes = {
  /** Form content, typically form fields */
  children: PropTypes.node.isRequired,
  
  /** Form submission handler */
  onSubmit: PropTypes.func.isRequired,
  
  /** Text for the submit button */
  submitLabel: PropTypes.string,
  
  /** Text for the cancel button (only shown if onCancel is provided) */
  cancelLabel: PropTypes.string,
  
  /** Cancel button click handler */
  onCancel: PropTypes.func,
  
  /** Whether the form is in a loading state */
  loading: PropTypes.bool,
  
  /** Error message or error object to display */
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.bool,
  ]),
  
  /** Whether the form was submitted successfully */
  success: PropTypes.bool,
  
  /** Success message to display when the form is submitted successfully */
  successMessage: PropTypes.node,
  
  /** Whether to show success message */
  showSuccess: PropTypes.bool,
  
  /** Whether to show error message */
  showError: PropTypes.bool,
  
  /** Whether the form should take up the full width of its container */
  fullWidth: PropTypes.bool,
  
  /** Maximum width of the form */
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
  
  /** Spacing between form elements */
  spacing: PropTypes.number,
  
  /** Additional props for the submit button */
  submitButtonProps: PropTypes.object,
  
  /** Additional props for the cancel button */
  cancelButtonProps: PropTypes.object,
  
  /** Additional props for the Paper component */
  paperProps: PropTypes.object,
  
  /** Additional styles */
  sx: PropTypes.object,
};

export default Form;
