// @ts-nocheck
import React, { forwardRef } from 'react';
import {
  TextField,
  FormControl,
  FormLabel,
  FormHelperText,
  InputAdornment,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import PropTypes from 'prop-types';

/**
 * Reusable form input component with validation and consistent styling
 */
const FormInput = forwardRef(({
  name,
  label,
  control,
  errors,
  type = 'text',
  placeholder,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  multiline = false,
  rows,
  maxRows,
  minRows,
  startAdornment,
  endAdornment,
  showPasswordToggle = false,
  size = 'medium',
  variant = 'outlined',
  InputLabelProps,
  InputProps,
  FormHelperTextProps,
  sx = {},
  ...props
}, ref) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = React.useState(false);
  
  // Determine if the field has an error
  const error = errors?.[name];
  const hasError = !!error;
  const errorMessage = error?.message;
  
  // Handle password visibility toggle
  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  
  // Determine input type based on password visibility
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  // Determine end adornment (password toggle or custom endAdornment)
  const endAdornmentContent = React.useMemo(() => {
    if (showPasswordToggle && type === 'password') {
      return (
        <InputAdornment position="end">
          <IconButton
            aria-label="toggle password visibility"
            onClick={handleClickShowPassword}
            edge="end"
            size={size}
            sx={{
              color: hasError ? theme.palette.error.main : 'action.active',
            }}
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      );
    }
    return endAdornment;
  }, [endAdornment, hasError, showPassword, showPasswordToggle, size, theme.palette.error.main, type]);
  
  // Determine start adornment
  const startAdornmentContent = startAdornment && (
    <InputAdornment position="start">
      {startAdornment}
    </InputAdornment>
  );
  
  // Form control styles
  const formControlSx = {
    width: fullWidth ? '100%' : 'auto',
    ...sx,
  };
  
  // Text field styles
  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '&.Mui-focused fieldset': {
        borderColor: hasError ? theme.palette.error.main : theme.palette.primary.main,
      },
      '&:hover fieldset': {
        borderColor: hasError ? theme.palette.error.light : theme.palette.grey[400],
      },
      '&.Mui-error fieldset': {
        borderColor: theme.palette.error.main,
      },
    },
    '& .MuiInputLabel-root': {
      color: hasError ? theme.palette.error.main : 'inherit',
    },
    '& .MuiFormHelperText-root': {
      marginLeft: 0,
      marginRight: 0,
    },
  };
  
  return (
    <FormControl 
      fullWidth={fullWidth} 
      error={hasError}
      disabled={disabled}
      sx={formControlSx}
      variant={variant}
    >
      {label && (
        <FormLabel 
          component="legend" 
          sx={{
            mb: 0.5,
            color: hasError ? 'error.main' : 'text.primary',
            fontWeight: 500,
          }}
        >
          {label}
          {required && (
            <Typography 
              component="span" 
              sx={{ 
                color: 'error.main',
                ml: 0.5,
              }}
            >
              *
            </Typography>
          )}
        </FormLabel>
      )}
      
      <TextField
        name={name}
        type={inputType}
        placeholder={placeholder}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        multiline={multiline}
        rows={rows}
        maxRows={maxRows}
        minRows={minRows}
        disabled={disabled}
        required={required}
        error={hasError}
        inputRef={ref}
        InputProps={{
          startAdornment: startAdornmentContent,
          endAdornment: endAdornmentContent,
          ...InputProps,
        }}
        InputLabelProps={{
          shrink: true,
          ...InputLabelProps,
        }}
        FormHelperTextProps={{
          component: 'div',
          ...FormHelperTextProps,
        }}
        sx={textFieldSx}
        {...props}
      />
      
      {(errorMessage || helperText) && (
        <FormHelperText 
          error={hasError}
          sx={{
            mt: 0.5,
            ml: 0,
            color: hasError ? 'error.main' : 'text.secondary',
            fontSize: '0.75rem',
            lineHeight: 1.2,
          }}
        >
          {errorMessage || helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
});

FormInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  control: PropTypes.object,
  errors: PropTypes.object,
  type: PropTypes.oneOf([
    'text',
    'email',
    'password',
    'number',
    'tel',
    'url',
    'search',
    'date',
    'datetime-local',
    'time',
    'month',
    'week',
  ]),
  placeholder: PropTypes.string,
  helperText: PropTypes.node,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  maxRows: PropTypes.number,
  minRows: PropTypes.number,
  startAdornment: PropTypes.node,
  endAdornment: PropTypes.node,
  showPasswordToggle: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium']),
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
  InputLabelProps: PropTypes.object,
  InputProps: PropTypes.object,
  FormHelperTextProps: PropTypes.object,
  sx: PropTypes.object,
};

export default FormInput;
