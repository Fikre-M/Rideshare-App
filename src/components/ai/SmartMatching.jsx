import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Avatar,
  Chip,
  Alert,
  LinearProgress,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  PersonSearch as MatchIcon,
  DirectionsCar as CarIcon,
  Star as StarIcon,
  Schedule as TimeIcon,
  LocationOn as LocationIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
  Psychology as AIIcon,
} from '@mui/icons-material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import aiService from '../../services/aiService';

const MatchCard = styled(Card)(({ theme, selected }) => ({
  border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  background: selected ? `${theme.palette.primary.main}08` : theme.palette.background.paper,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const ScoreCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.main}25 100%)`,
  border: `1px solid ${theme.palette.success.main}`,
}));

const SmartMatching = () => {
  const [passengerRequest, setPassengerRequest] = useState({
    pickup: 'Bole Area',
    destination: 'Piazza',
    passengerCount: 1,
    vehiclePreference: 'any',
    priorityFactor: 'time', // time, cost, rating
  });
  const [matching, setMatching] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState(null);

  const findMatches = async () => {
    setIsMatching(true);
    setError(null);

    try {
      const result = await aiService.matchDriverPassenger(passengerRequest);
      setMatching(result);
      setSelectedDriver(result.matchedDriver);
    } catch (err) {
      setError('Failed to find driver matches. Please try again.');
    } finally {
      setIsMatching(false);
    }
  };

  useEffect(() => {
    findMatches();
  }, []);

  const handleInputChange = (field) => (event) => {
    setPassengerRequest({
      ...passengerRequest,
      [field]: event.target.value,
    });
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  const radarData = matching ? [
    { subject: 'Proximity', A: matching.matchingFactors.proximity * 100, fullMark: 100 },
    { subject: 'Rating', A: matching.matchingFactors.rating * 100, fullMark: 100 },
    { subject: 'Vehicle Type', A: matching.matchingFactors.vehicleType * 100, fullMark: 100 },
    { subject: 'Availability', A: matching.matchingFactors.availability * 100, fullMark: 100 },
  ] : [];

  // Mock alternative drivers for demonstration
  const alternativeDrivers = [
    {
      id: 'driver_124',
      name: 'Sarah Johnson',
      rating: 4.6,
      eta: 5,
      vehicle: 'Honda Civic - XYZ 789',
      matchScore: 0.75,
    },
    {
      id: 'driver_125',
      name: 'Mike Wilson',
      rating: 4.9,
      eta: 7,
      vehicle: 'Toyota Corolla - DEF 456',
      matchScore: 0.82,
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <MatchIcon sx={{ mr: 1 }} />
        AI Smart Matching
      </Typography>

      {/* Passenger Request Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Ride Request Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Pickup Location"
              value={passengerRequest.pickup}
              onChange={handleInputChange('pickup')}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Destination"
              value={passengerRequest.destination}
              onChange={handleInputChange('destination')}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Passengers"
              value={passengerRequest.passengerCount}
              onChange={handleInputChange('passengerCount')}
              variant="outlined"
              SelectProps={{ native: true }}
            >
              <option value={1}>1 Passenger</option>
              <option value={2}>2 Passengers</option>
              <option value={3}>3 Passengers</option>
              <option value={4}>4 Passengers</option>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Vehicle Type"
              value={passengerRequest.vehiclePreference}
              onChange={handleInputChange('vehiclePreference')}
              variant="outlined"
              SelectProps={{ native: true }}
            >
              <option value="any">Any Vehicle</option>
              <option value="economy">Economy</option>
              <option value="comfort">Comfort</option>
              <option value="premium">Premium</option>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={findMatches}
              disabled={isMatching}
              sx={{ height: '56px' }}
              startIcon={<AIIcon />}
            >
              {isMatching ? 'Matching...' : 'Find Match'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isMatching && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            AI Finding Best Driver Match...
          </Typography>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Analyzing driver locations, ratings, vehicle types, availability, and passenger preferences...
          </Typography>
        </Paper>
      )}

      {matching && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid container spacing={3}>
            {/* Best Match */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckIcon sx={{ mr: 1, color: 'success.main' }} />
                  Best AI Match Found
                </Typography>
                
                <MatchCard selected={true}>
                  <CardContent>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              mx: 'auto',
                              mb: 1,
                              bgcolor: 'primary.main',
                              fontSize: '2rem',
                            }}
                          >
                            {matching.matchedDriver.name.charAt(0)}
                          </Avatar>
                          <Typography variant="h6">{matching.matchedDriver.name}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                            <Rating value={matching.matchedDriver.rating} precision={0.1} readOnly size="small" />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {matching.matchedDriver.rating}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography>{matching.matchedDriver.vehicle}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography>{matching.matchedDriver.eta} minutes away</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography>Currently near your location</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <ScoreCard>
                          <Typography variant="h3" color="success.main" gutterBottom>
                            {(matching.matchScore * 100).toFixed(0)}%
                          </Typography>
                          <Typography variant="subtitle2">
                            Match Score
                          </Typography>
                          <Chip
                            label="Excellent Match"
                            color="success"
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </ScoreCard>
                      </Grid>
                    </Grid>
                  </CardContent>
                </MatchCard>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<CheckIcon />}
                  >
                    Confirm Ride with {matching.matchedDriver.name}
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Match Analysis */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: 'fit-content' }}>
                <Typography variant="h6" gutterBottom>
                  AI Match Analysis
                </Typography>
                <Box sx={{ height: 250, mb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Match Factors"
                        dataKey="A"
                        stroke="#1976d2"
                        fill="#1976d2"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  Matching Factors
                </Typography>
                {Object.entries(matching.matchingFactors).map(([factor, score]) => (
                  <Box key={factor} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {factor.replace(/([A-Z])/g, ' $1').trim()}
                      </Typography>
                      <Typography variant="body2" color={getScoreColor(score)}>
                        {(score * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={score * 100}
                      color={getScoreColor(score)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                ))}
              </Paper>
            </Grid>

            {/* Alternative Matches */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Alternative Matches ({matching.alternativeDrivers} available)
                </Typography>
                <Grid container spacing={2}>
                  {alternativeDrivers.map((driver) => (
                    <Grid item xs={12} md={6} key={driver.id}>
                      <MatchCard>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                              {driver.name.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1">{driver.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {driver.vehicle}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Rating value={driver.rating} precision={0.1} readOnly size="small" />
                                <Typography variant="body2" sx={{ ml: 1, mr: 2 }}>
                                  {driver.rating}
                                </Typography>
                                <Chip
                                  label={`${driver.eta} min`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" color="primary.main">
                                {(driver.matchScore * 100).toFixed(0)}%
                              </Typography>
                              <Typography variant="caption">Match</Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </MatchCard>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      )}
    </Box>
  );
};

export default SmartMatching;