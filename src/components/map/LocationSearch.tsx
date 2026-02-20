import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TextField,
  Autocomplete,
  Box,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { LocationSearchResult } from '../../types/map';

// Custom debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface LocationSearchProps {
  label: string;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  placeholder?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  label,
  onLocationSelect,
  placeholder = 'Search for a location...',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<LocationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function
  const searchLocation = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 3) {
        setOptions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query
          )}&format=json&limit=5&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'RideshareApp/1.0',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }

        const data: LocationSearchResult[] = await response.json();
        
        if (data.length === 0) {
          setError('No locations found. Try a different search term.');
        }
        
        setOptions(data);
      } catch (err) {
        console.error('Geocoding error:', err);
        setError('Failed to search locations. Please try again.');
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 600),
    []
  );

  useEffect(() => {
    searchLocation(inputValue);
  }, [inputValue, searchLocation]);

  const handleSelect = (
    event: React.SyntheticEvent,
    value: LocationSearchResult | null
  ) => {
    if (value) {
      const lat = parseFloat(value.lat);
      const lng = parseFloat(value.lon);
      onLocationSelect(lat, lng, value.display_name);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option.display_name}
        filterOptions={(x) => x} // Disable built-in filtering
        loading={loading}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={handleSelect}
        noOptionsText={
          error || (inputValue.length < 3 ? 'Type at least 3 characters' : 'No locations found')
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            variant="outlined"
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <LocationOn sx={{ color: 'action.active', mr: 1 }} />
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.place_id}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <LocationOn sx={{ color: 'text.secondary', mr: 1 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" noWrap>
                  {option.display_name}
                </Typography>
                {option.type && (
                  <Typography variant="caption" color="text.secondary">
                    {option.type}
                  </Typography>
                )}
              </Box>
            </Box>
          </li>
        )}
        PaperComponent={(props) => (
          <Paper {...props} elevation={8} />
        )}
      />
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default LocationSearch;
