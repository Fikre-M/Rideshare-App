// @ts-nocheck
import { Component } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ReportProblem as ReportIcon } from '@mui/icons-material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // Optionally trigger a reset of the app state here
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="50vh"
          p={3}
          textAlign="center"
        >
          <ReportIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Something went wrong
          </Typography>
          <Typography color="textSecondary" paragraph>
            We're sorry for the inconvenience. Please try again or contact support if the problem persists.
          </Typography>
          {this.state.error && (
            <Typography variant="caption" color="textSecondary" paragraph>
              {this.state.error.toString()}
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleRetry}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
