# PWA Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Generate Icons (One-Time Setup)

```bash
npm run generate-icons
```

Then open `/public/icons/generate-png.html` in your browser and click the buttons to download PNG icons. Save them in `/public/icons/`.

### Step 2: Build the App

```bash
npm run build
```

### Step 3: Test PWA Features

```bash
npm run preview
```

Visit `http://localhost:3003` and:
1. Open DevTools > Application > Service Workers
2. Check "Offline" to test offline mode
3. Look for the install prompt after 3 seconds
4. Click "Install App" to install

### Step 4: Enable Notifications in Your Components

#### Example: Smart Matching with Notifications

```javascript
import { useNotifications } from '@/hooks/useNotifications';

function SmartMatching() {
  const { requestPermissionAfterMatch, notifyDriverMatched } = useNotifications();

  const handleDriverMatch = async (driver) => {
    // Request permission after first match
    await requestPermissionAfterMatch();
    
    // Show notification
    await notifyDriverMatched({
      name: driver.name,
      eta: driver.eta,
      rating: driver.rating,
      vehicleType: driver.vehicle
    });
  };

  return (
    <button onClick={() => handleDriverMatch(mockDriver)}>
      Find Driver
    </button>
  );
}
```

#### Example: Trip Updates

```javascript
import { useNotifications } from '@/hooks/useNotifications';

function TripTracker({ tripId }) {
  const { notifyDriverArriving, notifyTripUpdate } = useNotifications();

  useEffect(() => {
    // Listen for trip updates
    socket.on('driver-arriving', (data) => {
      notifyDriverArriving(data.driverName, data.eta);
    });

    socket.on('trip-status', (data) => {
      notifyTripUpdate(data.message, data.trip);
    });
  }, [tripId]);

  return <div>Tracking trip...</div>;
}
```

### Step 5: Add Notification Settings to Your App

```javascript
import NotificationSettings from '@/components/settings/NotificationSettings';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <NotificationSettings />
    </div>
  );
}
```

## 📱 Testing on Mobile

### Android
1. Build and deploy to your server (HTTPS required)
2. Open in Chrome on Android
3. Tap menu (⋮) > "Install app"
4. Test notifications and offline mode

### iOS
1. Build and deploy to your server (HTTPS required)
2. Open in Safari on iOS
3. Tap Share > "Add to Home Screen"
4. Test offline mode (notifications limited on iOS)

## 🎯 Key Features

### ✅ Installable
- Custom install prompt appears after 3 seconds
- Remembers dismissal for 7 days
- Works on desktop and mobile

### ✅ Offline Support
- App shell cached with CacheFirst
- Mapbox tiles cached with StaleWhileRevalidate
- Beautiful offline fallback page
- Shows last cached AI results

### ✅ Push Notifications
- Driver match notifications
- Trip update alerts
- Driver arriving notifications
- Price drop alerts

### ✅ Auto-Update
- Shows "New version available" snackbar
- One-click update
- Seamless background updates

## 🔧 Configuration

### Customize Theme Color

Edit `vite.config.js`:

```javascript
VitePWA({
  manifest: {
    theme_color: '#1976d2', // Change this
    background_color: '#ffffff'
  }
})
```

### Customize Cache Duration

Edit `vite.config.js`:

```javascript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.(js|css|html)$/,
      handler: 'CacheFirst',
      options: {
        expiration: {
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    }
  ]
}
```

### Customize Install Prompt Delay

Edit `src/components/pwa/InstallPrompt.jsx`:

```javascript
setTimeout(() => {
  setShowPrompt(true);
}, 3000); // Change delay here (milliseconds)
```

## 🐛 Troubleshooting

### Install Prompt Not Showing?
- Wait 3 seconds after page load
- Check if already installed
- Verify icons exist in `/public/icons/`
- Check browser console for errors

### Service Worker Not Working?
- Ensure HTTPS (required)
- Build for production: `npm run build`
- Clear browser cache
- Check DevTools > Application > Service Workers

### Notifications Not Working?
- Check browser supports notifications
- Grant permission when prompted
- Ensure HTTPS connection
- Check notification settings in app

## 📚 Next Steps

1. **Customize Icons**: Replace generated icons with your brand
2. **Add Shortcuts**: Edit manifest shortcuts in `vite.config.js`
3. **Implement Background Sync**: For offline actions
4. **Add Share Target**: Allow sharing to your app
5. **Optimize Caching**: Fine-tune cache strategies

## 🎉 You're Done!

Your app is now a fully functional PWA with:
- ✅ Offline support
- ✅ Install capability
- ✅ Push notifications
- ✅ Auto-updates
- ✅ Beautiful UI

Deploy to production and enjoy your PWA! 🚀
