import { useEffect } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { Snackbar, Button, IconButton } from '@mui/material';
import { usePWA } from '../../utils/pwa';

const UpdatePrompt = () => {
  const { needRefresh, offlineReady, updateApp, closePrompt } = usePWA();

  useEffect(() => {
    if (needRefresh) {
      console.log('New version available - prompting user to update');
    }
    if (offlineReady) {
      console.log('App is ready to work offline');
    }
  }, [needRefresh, offlineReady]);

  return (
    <>
      {/* Update Available Snackbar */}
      <Snackbar
        open={needRefresh}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '12px 20px',
            minWidth: '320px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          },
        }}
        message={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <RefreshCw size={20} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                New version available
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Update now to get the latest features
              </div>
            </div>
          </div>
        }
        action={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button
              size="small"
              onClick={updateApp}
              sx={{
                color: 'white',
                background: 'rgba(255, 255, 255, 0.2)',
                fontWeight: 600,
                borderRadius: '8px',
                padding: '6px 16px',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              Update Now
            </Button>
            <IconButton
              size="small"
              onClick={closePrompt}
              sx={{
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <X size={18} />
            </IconButton>
          </div>
        }
      />

      {/* Offline Ready Notification */}
      <AnimatePresence>
        {offlineReady && (
          <m.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '20px',
              zIndex: 9999,
              maxWidth: '320px',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '12px',
                padding: '16px 20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                  Ready to work offline
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  App cached for offline use
                </div>
              </div>
              <IconButton
                size="small"
                onClick={closePrompt}
                sx={{
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <X size={18} />
              </IconButton>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UpdatePrompt;
