// @ts-nocheck
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Grid,
  Avatar,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Apple as AppleIcon,
  SmartToy as AIIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { m } from 'framer-motion';
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";


const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 24,
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: 12,
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontSize: '0.95rem',
  fontWeight: 600,
  boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
    boxShadow: '0 12px 32px rgba(25, 118, 210, 0.4)',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
}));

const SocialButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(0.75),
  border: `2px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
}));

const DemoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: 12,
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateY(-2px)',
  },
}));

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field) => (event) => {
    const value = field === 'rememberMe' ? event.target.checked : event.target.value;
    setFormData({ ...formData, [field]: value });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const success = await login(formData.email, formData.password);
    if (!success) {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (email, password) => {
    setFormData({ ...formData, email, password });
    login(email, password);
  };

  const demoAccounts = [
    {
      email: "admin@airideshare.com",
      password: "admin123",
      name: "AI Admin",
      role: "Admin Dashboard",
      color: "warning",
    },
    {
      email: "user@airideshare.com",
      password: "user123",
      name: "John Doe",
      role: "Passenger Account",
      color: "primary",
    },
    {
      email: "driver@airideshare.com",
      password: "driver123",
      name: "Sarah Wilson",
      role: "Driver Account",
      color: "success",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        py: 2,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Login Form */}
          <Grid item xs={12} md={6}>
            <m.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <StyledPaper>
                <Box textAlign="center" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 48,
                      height: 48,
                      mx: "auto",
                      mb: 1,
                    }}
                  >
                    {/* <LoginIcon sx={{ fontSize: 32 }} /> */}
                  </Avatar>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Welcome Back
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sign in to your AI Rideshare account
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange("email")}
                        variant="outlined"
                        required
                        size="small"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange("password")}
                        variant="outlined"
                        required
                        size="small"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                size="small"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>
                  </Grid>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.rememberMe}
                          onChange={handleInputChange("rememberMe")}
                          color="primary"
                        />
                      }
                      label="Remember me"
                    />
                    <Link
                      to="/forgot-password"
                      style={{
                        color: "#1976d2",
                        textDecoration: "none",
                        fontSize: "0.875rem",
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Box>

                  <GradientButton
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                    startIcon={<LoginIcon />}
                    sx={{ mb: 1.5 }}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </GradientButton>
                </form>

                <Divider sx={{ my: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Or continue with
                  </Typography>
                </Divider>

                <Grid container spacing={1} sx={{ mb: 1.5 }}>
                  <Grid item xs={4}>
                    <SocialButton fullWidth startIcon={<GoogleIcon />}>
                      Google
                    </SocialButton>
                  </Grid>
                  <Grid item xs={4}>
                    <SocialButton fullWidth startIcon={<FacebookIcon />}>
                      Facebook
                    </SocialButton>
                  </Grid>
                  <Grid item xs={4}>
                    <SocialButton fullWidth startIcon={<AppleIcon />}>
                      Apple
                    </SocialButton>
                  </Grid>
                </Grid>

                <Box textAlign="center" mb={1.5}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      style={{
                        color: "#1976d2",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      Sign Up
                    </Link>
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Demo Accounts
                  </Typography>
                </Divider>

                <Grid container spacing={1}>
                  {demoAccounts.map((account, index) => (
                    <Grid item xs={4} key={index}>
                      <DemoCard
                        onClick={() =>
                          handleDemoLogin(account.email, account.password)
                        }
                      >
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                          <Avatar
                            sx={{
                              bgcolor: `${account.color}.main`,
                              width: 32,
                              height: 32,
                            }}
                          >
                            {account.name.charAt(0)}
                          </Avatar>
                          <Box textAlign="center">
                            <Typography variant="caption" fontWeight="bold" display="block">
                              {account.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{ fontSize: '0.65rem' }}
                            >
                              {account.role}
                            </Typography>
                          </Box>
                        </Box>
                      </DemoCard>
                    </Grid>
                  ))}
                </Grid>
              </StyledPaper>
            </m.div>
          </Grid>

          {/* Right Side - Branding */}
          <Grid item xs={12} md={6}>
            <m.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box sx={{ color: "white", mb: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 3,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateX(5px)",
                      opacity: 0.9,
                    },
                  }}
                  onClick={() => navigate("/")}
                >
                  <LocalTaxiIcon sx={{ fontSize: 48, mr: 2 }} />
                  <Typography variant="h3" fontWeight="bold">
                    AI Rideshare
                  </Typography>
                </Box>
                <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                  The Future of Transportation
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mb: 4, opacity: 0.8, lineHeight: 1.6 }}
                >
                  Discover smart ride matching, real-time dynamic pricing, and
                  predictive analytics driven by advanced AI. Join thousands of
                  users who rely on our platform for their everyday
                  transportation needs.
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {[
                    "🤖 AI Matching",
                    "💰 Smart Pricing",
                    "🗺️ Route Optimization",
                    "📊 Predictive Analytics",
                  ].map((feature, index) => (
                    <Box
                      key={index}
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(10px)",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </m.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;