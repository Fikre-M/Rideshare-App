import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Rating,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
  DirectionsCar as CarIcon,
  Schedule as TimeIcon,
  AttachMoney as PriceIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import aiService from '../../services/aiService';

const BookingCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'visible',
}));

const VehicleCard = styled(Card)(({ theme, selected }) => ({
  cursor: 'pointer',
  borderRadius: 16,
  border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  backgroundColor: selected ? `${theme.palette.primary.main}08` : theme.palette.background.paper,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const DriverCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  border: `1px solid ${theme.palette.divider}`,
}));

const steps = ['Pickup & Destination', 'Choose Vehicle', 'Confirm Booking'];

const vehicleTypes = [
  {
    id: 'economy',
    name: 'Economy',
    description: 'Affordable rides for everyday trips',
    icon: '🚗',
    capacity: 4,
    basePrice: 8.50,
    eta: '3-5 min',
    features: ['Air Conditioning', 'Music'],
  },
  {
    id: 'comfort',
    name: 'Comfort',
    description: 'Extra space and premium features',
    icon: '🚙',
    capacity: 4,
    basePrice: 12.00,
    eta: '4-6 min',
    features: ['Premium Interior', 'Phone Charger', 'Water'],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Luxury vehicles for special occasions',
    icon: '🚘',
    capacity: 4,
    basePrice: 18.00,
    eta: '5-8 min',
    features: ['Luxury Interior', 'Professional Driver', 'Refreshments'],
  },
];

const RideBooking = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    pickup: '',
    destination: '',
    vehicleType: '',
    scheduledTime: '',
    passengers: 1,
  });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [matchedDriver, setMatchedDriver] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field) => (event) => {
    setBookingData({ ...bookingData, [field]: event.target.value });
    setError('');
  };

  const handleVehicleSelect = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setBookingData({ ...bookingData, vehicleType: vehicle.id });
    setIsLoading(true);

    try {
      // Get dynamic pricing
      const pricingResult = await aiService.calculateDynamicPrice({
        pickup: bookingData.pickup,
        destination: bookingData.destination,
        vehicleType: vehicle.id,
        distance: Math.random() * 15 + 5, // Mock distance
        estimatedTime: Math.random() * 30 + 10, // Mock time
      });
      setPricing(pricingResult);

      // Find matched driver
      const matchResult = await aiService.matchDriverPassenger({
        pickup: bookingData.pickup,
        destination: bookingData.destination,
        vehicleType: vehicle.id,
        passengers: bookingData.passengers,
      });
      setMatchedDriver(matchResult.matchedDriver);
    } catch (err) {
      setError('Failed to get pricing and driver information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!bookingData.pickup || !bookingData.destination) {
        setError('Please enter both pickup and destination locations');
        return;
      }
    }
    if (activeStep === 1 && !selectedVehicle) {
      setError('Please select a vehicle type');
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleBookRide = async () => {
    setIsLoading(true);
    try {
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would create the booking
      alert('Ride booked successfully! Your driver will arrive in ' + selectedVehicle.eta);
      
      // Reset form
      setActiveStep(0);
      setBookingData({
        pickup: '',
        destination: '',
        vehicleType: '',
        scheduledTime: '',
        passengers: 1,
      });
      setSelectedVehicle(null);
      setMatchedDriver(null);
      setPricing(null);
    } catch (err) {
      setError('Failed to book ride. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode these coordinates
          setBookingData({ 
            ...bookingData, 
            pickup: `Current Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})` 
          });
        },
        (error) => {
          setError('Unable to get your location');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Where would you like to go?
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                  <LocationIcon sx={{ color: 'success.main', mb: 1 }} />
                  <TextField
                    fullWidth
                    label="Pickup Location"
                    value={bookingData.pickup}
                    onChange={handleInputChange('pickup')}
                    variant="outlined"
                    placeholder="Enter pickup address"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Tooltip title="Use current location">
                    <IconButton onClick={getCurrentLocation} color="primary">
                      <MyLocationIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                  <LocationIcon sx={{ color: 'error.main', mb: 1 }} />
                  <TextField
                    fullWidth
                    label="Destination"
                    value={bookingData.destination}
                    onChange={handleInputChange('destination')}
                    variant="outlined"
                    placeholder="Where to?"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Passengers"
                  type="number"
                  value={bookingData.passengers}
                  onChange={handleInputChange('passengers')}
                  variant="outlined"
                  inputProps={{ min: 1, max: 8 }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Schedule Time (Optional)"
                  type="datetime-local"
                  value={bookingData.scheduledTime}
                  onChange={handleInputChange('scheduledTime')}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Choose your ride
            </Typography>
            <Grid container spacing={3}>
              {vehicleTypes.map((vehicle) => (
                <Grid item xs={12} key={vehicle.id}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <VehicleCard
                      selected={selectedVehicle?.id === vehicle.id}
                      onClick={() => handleVehicleSelect(vehicle)}
                    >
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={2}>
                            <Typography variant="h2" sx={{ fontSize: '2.5rem' }}>
                              {vehicle.icon}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="h6" fontWeight="bold">
                              {vehicle.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {vehicle.description}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {vehicle.features.map((feature, index) => (
                                <Chip
                                  key={index}
                                  label={feature}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Grid>
                          <Grid item xs={2}>
                            <Box textAlign="center">
                              <Typography variant="body2" color="text.secondary">
                                <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                {vehicle.capacity}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <TimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                {vehicle.eta}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={2}>
                            <Box textAlign="center">
                              <Typography variant="h6" color="primary.main" fontWeight="bold">
                                ${vehicle.basePrice}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Base fare
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </VehicleCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Confirm your booking
            </Typography>
            
            {matchedDriver && (
              <DriverCard sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Your Driver
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Avatar
                      sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}
                    >
                      {matchedDriver.name.charAt(0)}
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6">{matchedDriver.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={matchedDriver.rating} precision={0.1} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {matchedDriver.rating} • {matchedDriver.vehicle}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Arriving in {matchedDriver.eta} minutes
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton color="primary">
                        <PhoneIcon />
                      </IconButton>
                      <IconButton color="primary">
                        <MessageIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </DriverCard>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Trip Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ color: 'success.main', mr: 1 }} />
                  <Typography variant="body2">{bookingData.pickup}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ color: 'error.main', mr: 1 }} />
                  <Typography variant="body2">{bookingData.destination}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2">{bookingData.passengers} passenger(s)</Typography>
                </Box>
              </Box>
              
              {pricing && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Fare Breakdown
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Base fare</Typography>
                    <Typography variant="body2">${pricing.priceBreakdown.baseFare.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Distance & time</Typography>
                    <Typography variant="body2">
                      ${(pricing.priceBreakdown.distanceRate + pricing.priceBreakdown.timeRate).toFixed(2)}
                    </Typography>
                  </Box>
                  {pricing.priceBreakdown.surge > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Surge pricing</Typography>
                      <Typography variant="body2">${pricing.priceBreakdown.surge.toFixed(2)}</Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="bold">Total</Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      ${pricing.finalPrice.toFixed(2)}
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <BookingCard>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          Book Your AI-Powered Ride
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent(activeStep)}
          </motion.div>
        </AnimatePresence>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ borderRadius: 2 }}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleBookRide}
              disabled={isLoading}
              sx={{ 
                borderRadius: 2,
                px: 4,
                background: 'linear-gradient(135deg, #1976d2 0%, #dc004e 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #9a0036 100%)',
                }
              }}
            >
              {isLoading ? 'Booking...' : 'Book Ride'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Next
            </Button>
          )}
        </Box>
      </CardContent>
    </BookingCard>
  );
};

export default RideBooking;