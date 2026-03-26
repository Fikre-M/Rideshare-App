// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
// main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'leaflet/dist/leaflet.css'; // Leaflet CSS for maps
import { initSentry, handleUnhandledError, handleUnhandledRejection } from './utils/sentry';

// Initialize Sentry error tracking
initSentry();

// Global error handling
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
  handleUnhandledError(event.error, { 
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  handleUnhandledRejection(event);
});

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);