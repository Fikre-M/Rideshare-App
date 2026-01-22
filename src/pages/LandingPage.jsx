import { Box, Button, Container, Typography, Grid, Paper, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '@/context/AuthContext';

const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '80vh',
  display: 'flex',
  alignItems: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(8, 0),
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const features = [
  {
    title: 'AI-Powered Smart Matching',
    description: 'Advanced algorithms instantly match passengers with the best available drivers based on location, preferences, and real-time conditions.',
    icon: '🤖',
  },
  {
    title: 'Dynamic AI Pricing',
    description: 'Machine learning models analyze demand, traffic, weather, and events to provide fair, real-time pricing optimization.',
    icon: '💰',
  },
  {
    title: 'Intelligent Route Optimization',
    description: 'AI algorithms calculate the most efficient routes considering traffic patterns, road conditions, and fuel efficiency.',
    icon: '🗺️',
  },
  {
    title: 'Predictive Analytics',
    description: 'Forecast demand patterns, revenue projections, and operational insights using advanced machine learning models.',
    icon: '📊',
  },
  {
    title: 'AI Chat Assistant',
    description: 'Intelligent chatbot provides 24/7 customer support, trip planning, and real-time assistance for all users.',
    icon: '💬',
  },
  {
    title: 'Real-time Demand Prediction',
    description: 'ML models predict ride demand hotspots and peak times to optimize driver deployment and reduce wait times.',
    icon: '📈',
  },
];

const LandingPage = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HeroSection>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                    mb: 3,
                  }}
                >
                  AI-Powered Rideshare Platform
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                  Experience the future of transportation with intelligent matching, dynamic pricing, and predictive analytics powered by advanced AI.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Button
                    component={Link}
                    to={isAuthenticated ? '/dashboard' : '/register'}
                    variant="contained"
                    color="secondary"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #dc004e 0%, #ff6b9d 100%)',
                      boxShadow: '0 8px 24px rgba(220, 0, 78, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #b8003e 0%, #e55a8a 100%)',
                        boxShadow: '0 12px 32px rgba(220, 0, 78, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                  </Button>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    color="inherit"
                    size="large"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Sign In
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box
                  component="img"
                  src="/images/transportation-hero.svg"
                  alt="Transportation Dashboard"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    boxShadow: theme.shadows[10],
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      <Box component="section" sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            sx={{ mb: 8, fontWeight: 700 }}
          >
            Why Choose Our AI Platform?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <FeatureCard elevation={3}>
                    <Typography variant="h3" sx={{ mb: 2, fontSize: '2.5rem' }}>
                      {feature.icon}
                    </Typography>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </FeatureCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6, mt: 'auto' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                AI Rideshare Platform
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revolutionizing transportation with artificial intelligence, smart matching, and predictive analytics.
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="subtitle1" gutterBottom>
                Product
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                <li><Button component={Link} to="/features" color="inherit">Features</Button></li>
                <li><Button component={Link} to="/pricing" color="inherit">Pricing</Button></li>
                <li><Button component={Link} to="/integrations" color="inherit">Integrations</Button></li>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="subtitle1" gutterBottom>
                Resources
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                <li><Button component={Link} to="/blog" color="inherit">Blog</Button></li>
                <li><Button component={Link} to="/documentation" color="inherit">Documentation</Button></li>
                <li><Button component={Link} to="/support" color="inherit">Support</Button></li>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <Typography variant="subtitle1" gutterBottom>
                Company
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                <li><Button component={Link} to="/about" color="inherit">About Us</Button></li>
                <li><Button component={Link} to="/careers" color="inherit">Careers</Button></li>
                <li><Button component={Link} to="/contact" color="inherit">Contact</Button></li>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} AI Rideshare Platform. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
