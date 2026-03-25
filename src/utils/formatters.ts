// Date formatter
export const formatDate = (dateString: string | Date, options: Intl.DateTimeFormatOptions = {}): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  
  return new Date(dateString).toLocaleString(undefined, defaultOptions);
};

// Currency formatter
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Distance formatter (meters to km/miles)
export const formatDistance = (meters: number, useMiles = false): string => {
  const distance = useMiles ? meters * 0.000621371 : meters / 1000;
  const unit = useMiles ? 'mi' : 'km';
  return `${distance.toFixed(2)} ${unit}`;
};

// Duration formatter (seconds to HH:MM:SS)
export const formatDuration = (seconds: number): string => {
  const date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substr(11, 8);
};

// Phone number formatter
export const formatPhoneNumber = (phoneNumber: string | number): string => {
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return String(phoneNumber);
};
