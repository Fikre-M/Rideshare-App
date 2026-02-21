import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { m } from 'framer-motion';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 24,
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: 12,
  padding: theme.spacing(1.5, 4),
  textTransform: 'none',
  fontSize: '1.1rem',
  fontWeight: 600,
  boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
    boxShadow: '0 12px 32px rgba(25, 118, 210, 0.4)',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
}));

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <StyledPaper>
            {!success ? (
              <>
                <Box textAlign="center" mb={4}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <EmailIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h4" gutterBottom fontWeight="bold">
                    Forgot Password?
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    No worries! Enter your email and we'll send you reset instructions.
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    required
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': { borderRadius: 2 },
                    }}
                  />

                  <GradientButton
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                    startIcon={<EmailIcon />}
                    sx={{ mb: 3 }}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </GradientButton>
                </form>

                <Box textAlign="center">
                  <Button
                    component={Link}
                    to="/login"
                    startIcon={<ArrowBackIcon />}
                    sx={{ textTransform: 'none' }}
                  >
                    Back to Login
                  </Button>
                </Box>
              </>
            ) : (
              <Box textAlign="center">
                <Avatar
                  sx={{
                    bgcolor: 'success.main',
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 48 }} />
                </Avatar>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                  Check Your Email
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  We've sent password reset instructions to <strong>{email}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Didn't receive the email? Check your spam folder or try again.
                </Typography>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Back to Login
                </Button>
              </Box>
            )}
          </StyledPaper>

          <Box textAlign="center" mt={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <LocalTaxiIcon sx={{ color: 'white' }} />
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                AI Rideshare Platform
              </Typography>
            </Box>
          </Box>
        </m.div>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
