import React from 'react';
import { Button, CircularProgress } from '@mui/material';

/**
 * LoadingButton component that shows a loading indicator when loading
 * @param {Object} props - Component props
 * @param {boolean} [props.loading=false] - Whether the button is in a loading state
 * @param {React.ReactNode} [props.loadingText] - Text to show during loading (defaults to children)
 * @param {string} [props.loadingPosition='start'] - Position of the loading indicator ('start' or 'end')
 * @param {number} [props.loaderSize=24] - Size of the loading indicator
 * @param {Object} [props.loaderSx] - Additional styles for the loading indicator
 * @param {React.ReactNode} props.children - Button content
 * @param {Object} [props.sx] - Additional styles for the button
 * @param {boolean} [props.disabled] - Whether the button is disabled
 * @param {string} [props.variant] - Button variant ('text', 'outlined', 'contained')
 * @param {string} [props.color] - Button color
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.type] - Button type ('button', 'submit', 'reset')
 * @param {string} [props.size] - Button size ('small', 'medium', 'large')
 * @param {boolean} [props.fullWidth] - Whether the button should take full width
 * @param {string} [props.className] - Additional CSS class
 * @returns {JSX.Element} Loading button component
 */
const LoadingButton = ({
  loading = false,
  loadingText,
  loadingPosition = 'start',
  loaderSize = 24,
  loaderSx = {},
  children,
  disabled,
  sx = {},
  ...props
}) => {
  const content = (
    <>
      {loading && loadingPosition === 'start' && (
        <CircularProgress
          size={loaderSize}
          sx={{
            marginRight: 1,
            color: 'inherit',
            ...loaderSx,
          }}
        />
      )}
      <span>{loading ? loadingText || children : children}</span>
      {loading && loadingPosition === 'end' && (
        <CircularProgress
          size={loaderSize}
          sx={{
            marginLeft: 1,
            color: 'inherit',
            ...loaderSx,
          }}
        />
      )}
    </>
  );

  return (
    <Button
      disabled={disabled || loading}
      sx={{
        position: 'relative',
        minWidth: loading ? 120 : 'auto',
        ...sx,
      }}
      {...props}
    >
      {content}
    </Button>
  );
};

export default React.memo(LoadingButton);
