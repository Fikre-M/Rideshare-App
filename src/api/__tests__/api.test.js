import axios from 'axios';
import { authAPI, vehiclesAPI, tripsAPI, analyticsAPI, dispatchAPI } from '..';

// Mock axios
jest.mock('axios');

describe('API', () => {
  const mockToken = 'test-token';
  const baseURL = 'http://localhost:5000/api';
  
  beforeEach(() => {
    // Store the original localStorage
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          store = {};
        }),
      };
    })();
    
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Set auth token
    localStorage.setItem('authToken', mockToken);
    
    // Mock axios instance
    axios.create.mockReturnValue({
      interceptors: {
        request: { use: jest.fn((fn) => fn) },
        response: { use: jest.fn() },
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    });
    
    // Reset all mocks
    jest.clearAllMocks();
  });
  
  describe('Auth API', () => {
    it('should call login with correct parameters', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const response = { data: { token: 'test-token', user: { id: 1, email: 'test@example.com' } } };
      
      axios.post.mockResolvedValueOnce(response);
      
      const result = await authAPI.login(credentials);
      
      expect(axios.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(response.data);
    });
    
    it('should call logout', async () => {
      await authAPI.logout();
      expect(axios.post).toHaveBeenCalledWith('/auth/logout');
    });
    
    it('should refresh token', async () => {
      const response = { data: { token: 'new-token' } };
      axios.post.mockResolvedValueOnce(response);
      
      const result = await authAPI.refreshToken();
      
      expect(axios.post).toHaveBeenCalledWith('/auth/refresh-token');
      expect(result).toEqual(response.data);
    });
    
    it('should get user profile', async () => {
      const response = { data: { id: 1, email: 'test@example.com' } };
      axios.get.mockResolvedValueOnce(response);
      
      const result = await authAPI.getProfile();
      
      expect(axios.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(response.data);
    });
  });
  
  describe('Vehicles API', () => {
    it('should get all vehicles', async () => {
      const params = { status: 'active' };
      const response = { data: [{ id: 1, name: 'Vehicle 1' }] };
      
      axios.get.mockResolvedValueOnce(response);
      
      const result = await vehiclesAPI.getAll(params);
      
      expect(axios.get).toHaveBeenCalledWith('/vehicles', { params });
      expect(result).toEqual(response.data);
    });
    
    it('should get vehicle by id', async () => {
      const vehicleId = 1;
      const response = { data: { id: 1, name: 'Vehicle 1' } };
      
      axios.get.mockResolvedValueOnce(response);
      
      const result = await vehiclesAPI.getById(vehicleId);
      
      expect(axios.get).toHaveBeenCalledWith(`/vehicles/${vehicleId}`);
      expect(result).toEqual(response.data);
    });
    
    it('should update vehicle status', async () => {
      const vehicleId = 1;
      const status = 'maintenance';
      const response = { data: { id: 1, status: 'maintenance' } };
      
      axios.patch.mockResolvedValueOnce(response);
      
      const result = await vehiclesAPI.updateStatus(vehicleId, status);
      
      expect(axios.patch).toHaveBeenCalledWith(
        `/vehicles/${vehicleId}/status`,
        { status }
      );
      expect(result).toEqual(response.data);
    });
  });
  
  describe('Trips API', () => {
    it('should get all trips', async () => {
      const params = { status: 'active' };
      const response = { data: [{ id: 1, status: 'active' }] };
      
      axios.get.mockResolvedValueOnce(response);
      
      const result = await tripsAPI.getAll(params);
      
      expect(axios.get).toHaveBeenCalledWith('/trips', { params });
      expect(result).toEqual(response.data);
    });
    
    it('should create a trip', async () => {
      const tripData = { pickup: 'A', dropoff: 'B' };
      const response = { data: { id: 1, ...tripData } };
      
      axios.post.mockResolvedValueOnce(response);
      
      const result = await tripsAPI.create(tripData);
      
      expect(axios.post).toHaveBeenCalledWith('/trips', tripData);
      expect(result).toEqual(response.data);
    });
  });
  
  describe('Analytics API', () => {
    it('should get KPIs', async () => {
      const params = { period: 'week' };
      const response = { data: { totalTrips: 100, revenue: 5000 } };
      
      axios.get.mockResolvedValueOnce(response);
      
      const result = await analyticsAPI.getKPIs(params);
      
      expect(axios.get).toHaveBeenCalledWith('/analytics/kpis', { params });
      expect(result).toEqual(response.data);
    });
    
    it('should get demand heatmap data', async () => {
      const params = { date: '2023-01-01' };
      const response = { data: { /* heatmap data */ } };
      
      axios.get.mockResolvedValueOnce(response);
      
      const result = await analyticsAPI.getDemandHeatmap(params);
      
      expect(axios.get).toHaveBeenCalledWith('/analytics/demand-heatmap', { params });
      expect(result).toEqual(response.data);
    });
  });
  
  describe('Dispatch API', () => {
    it('should get available drivers', async () => {
      const params = { location: 'downtown' };
      const response = { data: [{ id: 1, name: 'Driver 1' }] };
      
      axios.get.mockResolvedValueOnce(response);
      
      const result = await dispatchAPI.getAvailableDrivers(params);
      
      expect(axios.get).toHaveBeenCalledWith('/dispatch/available-drivers', { params });
      expect(result).toEqual(response.data);
    });
    
    it('should assign driver to trip', async () => {
      const tripId = 1;
      const driverId = 2;
      const response = { data: { tripId, driverId, status: 'assigned' } };
      
      axios.post.mockResolvedValueOnce(response);
      
      const result = await dispatchAPI.assignDriver(tripId, driverId);
      
      expect(axios.post).toHaveBeenCalledWith(
        `/dispatch/trips/${tripId}/assign`,
        { driverId }
      );
      expect(result).toEqual(response.data);
    });
  });
});
