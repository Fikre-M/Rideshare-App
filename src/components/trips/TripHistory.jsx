import { useState, useEffect, useMemo } from 'react';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  StarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const TripHistory = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Mock trip data - replace with actual API call
  useEffect(() => {
    const mockTrips = [
      {
        id: '1',
        date: '2024-01-20',
        time: '14:30',
        from: 'Downtown Office',
        to: 'Airport Terminal 1',
        distance: '25.4 km',
        duration: '35 min',
        cost: 45.50,
        driver: 'John Smith',
        rating: 5,
        status: 'completed',
        vehicle: 'Toyota Camry',
        paymentMethod: 'Credit Card',
        route: 'Highway Route',
        weather: 'Sunny'
      },
      {
        id: '2',
        date: '2024-01-18',
        time: '09:15',
        from: 'Home',
        to: 'Shopping Mall',
        distance: '12.8 km',
        duration: '22 min',
        cost: 28.75,
        driver: 'Sarah Johnson',
        rating: 4,
        status: 'completed',
        vehicle: 'Honda Civic',
        paymentMethod: 'Digital Wallet',
        route: 'City Route',
        weather: 'Cloudy'
      },
      {
        id: '3',
        date: '2024-01-15',
        time: '18:45',
        from: 'Restaurant',
        to: 'Home',
        distance: '8.2 km',
        duration: '18 min',
        cost: 22.00,
        driver: 'Mike Wilson',
        rating: 5,
        status: 'completed',
        vehicle: 'Nissan Altima',
        paymentMethod: 'Cash',
        route: 'Scenic Route',
        weather: 'Rainy'
      },
      {
        id: '4',
        date: '2024-01-12',
        time: '07:30',
        from: 'Home',
        to: 'Gym',
        distance: '5.1 km',
        duration: '12 min',
        cost: 15.25,
        driver: 'Lisa Brown',
        rating: 3,
        status: 'completed',
        vehicle: 'Ford Focus',
        paymentMethod: 'Credit Card',
        route: 'Direct Route',
        weather: 'Sunny'
      }
    ];
    
    setTimeout(() => {
      setTrips(mockTrips);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and search logic
  const filteredTrips = useMemo(() => {
    let filtered = trips;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(trip =>
        trip.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.driver.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(trip => trip.status === selectedFilter);
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(trip => {
        const tripDate = new Date(trip.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return tripDate >= startDate && tripDate <= endDate;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date + ' ' + a.time);
          bValue = new Date(b.date + ' ' + b.time);
          break;
        case 'cost':
          aValue = a.cost;
          bValue = b.cost;
          break;
        case 'distance':
          aValue = parseFloat(a.distance);
          bValue = parseFloat(b.distance);
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [trips, searchTerm, selectedFilter, dateRange, sortBy, sortOrder]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalTrips = trips.length;
    const totalSpent = trips.reduce((sum, trip) => sum + trip.cost, 0);
    const totalDistance = trips.reduce((sum, trip) => sum + parseFloat(trip.distance), 0);
    const averageRating = trips.reduce((sum, trip) => sum + trip.rating, 0) / totalTrips;
    const averageCost = totalSpent / totalTrips;
    
    const monthlyData = trips.reduce((acc, trip) => {
      const month = new Date(trip.date).toLocaleString('default', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { trips: 0, spent: 0 };
      }
      acc[month].trips += 1;
      acc[month].spent += trip.cost;
      return acc;
    }, {});

    return {
      totalTrips,
      totalSpent,
      totalDistance,
      averageRating,
      averageCost,
      monthlyData
    };
  }, [trips]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i}>
        {i < rating ? (
          <StarIconSolid className="h-4 w-4 text-yellow-400" />
        ) : (
          <StarIcon className="h-4 w-4 text-gray-300" />
        )}
      </span>
    ));
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'From', 'To', 'Distance', 'Duration', 'Cost', 'Driver', 'Rating'];
    const csvContent = [
      headers.join(','),
      ...filteredTrips.map(trip => [
        trip.date,
        trip.time,
        trip.from,
        trip.to,
        trip.distance,
        trip.duration,
        trip.cost,
        trip.driver,
        trip.rating
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trip-history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Trip History</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Analytics
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Trip Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analytics.totalTrips}</div>
                <div className="text-sm text-gray-600">Total Trips</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">${analytics.totalSpent.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{analytics.totalDistance.toFixed(1)} km</div>
                <div className="text-sm text-gray-600">Total Distance</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{analytics.averageRating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">${analytics.averageCost.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Avg Cost</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Trips</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="cost">Sort by Cost</option>
              <option value="distance">Sort by Distance</option>
              <option value="rating">Sort by Rating</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trip List */}
      <div className="space-y-4">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No trips found matching your criteria</div>
          </div>
        ) : (
          filteredTrips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <MapPinIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg text-gray-900">
                        {trip.from} → {trip.to}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm mt-1">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(trip.date).toLocaleDateString()}
                        <ClockIcon className="h-4 w-4 ml-3 mr-1" />
                        {trip.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">${trip.cost}</div>
                    <div className="flex items-center justify-end mt-1">
                      {renderStars(trip.rating)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Distance:</span>
                    <div className="font-medium">{trip.distance}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <div className="font-medium">{trip.duration}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Driver:</span>
                    <div className="font-medium">{trip.driver}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Vehicle:</span>
                    <div className="font-medium">{trip.vehicle}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Payment: {trip.paymentMethod}</span>
                    <span>Route: {trip.route}</span>
                    <span>Weather: {trip.weather}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedTrip(trip)}
                      className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Details
                    </button>
                    <button className="flex items-center px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                      <ShareIcon className="h-4 w-4 mr-1" />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Trip Details</h2>
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trip ID</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedTrip.id}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {selectedTrip.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Route</label>
                  <div className="mt-1 text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="ml-3">{selectedTrip.from}</div>
                    </div>
                    <div className="ml-1.5 w-0.5 h-8 bg-gray-300"></div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="ml-3">{selectedTrip.to}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {new Date(selectedTrip.date).toLocaleDateString()} at {selectedTrip.time}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedTrip.duration}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Distance</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedTrip.distance}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cost</label>
                    <div className="mt-1 text-sm text-gray-900 font-semibold">${selectedTrip.cost}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Driver</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedTrip.driver}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedTrip.vehicle}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedTrip.paymentMethod}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weather</label>
                    <div className="mt-1 text-sm text-gray-900">{selectedTrip.weather}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Rating</label>
                  <div className="mt-1 flex items-center">
                    {renderStars(selectedTrip.rating)}
                    <span className="ml-2 text-sm text-gray-600">({selectedTrip.rating}/5)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Book Similar Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripHistory;