# API Key Setup Instructions

## Quick Start

Your AI Rideshare Platform is now configured with a secure API key management system!

## What Changed?

1. ✅ `.env` removed from git tracking (never committed again)
2. ✅ `.gitignore` updated to exclude all environment files
3. ✅ Runtime configuration system added (`/public/config.js`)
4. ✅ In-app API key setup modal created
5. ✅ Key validation service implemented
6. ✅ Onboarding screen for first-time setup
7. ✅ Zustand store for secure key management (sessionStorage)

## How to Use

### Option 1: In-App Configuration (Easiest)

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser

3. You'll see a "Setup Required" screen

4. Click "Configure API Keys"

5. Enter your API keys:
   - **Google AI**: Get from https://makersuite.google.com/app/apikey
   - **OpenAI**: Get from https://platform.openai.com/api-keys
   - **Mapbox**: Get from https://account.mapbox.com/access-tokens/

6. Click "Validate" for each key

7. Click "Save & Continue"

### Option 2: Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your keys:
   ```env
   VITE_GOOGLE_AI_API_KEY=AIza...your_key_here
   VITE_MAPBOX_TOKEN=pk....your_token_here
   ```

3. Restart your dev server

## Files Created

- `src/stores/apiKeyStore.js` - Zustand store for API key management
- `src/services/keyValidator.js` - Validates API keys before accepting
- `src/components/settings/ApiKeySetup.jsx` - Settings modal for key configuration
- `src/components/onboarding/SetupRequired.jsx` - First-time setup screen
- `public/config.js` - Runtime configuration (for Docker/K8s)

## Files Modified

- `.gitignore` - Now excludes all `.env*` files
- `.env.example` - Updated with clear documentation
- `index.html` - Loads runtime config
- `src/App.jsx` - Shows setup screen when needed
- `src/services/googleAIService.js` - Uses API key store

## Security Features

- ✅ Keys stored in sessionStorage (cleared on browser close)
- ✅ Keys validated before acceptance
- ✅ Multiple configuration sources (session > runtime > env)
- ✅ No keys in version control
- ✅ Runtime injection for Docker/K8s

## Next Steps

1. **Commit the changes:**
   ```bash
   git add .
   git commit -m "Add secure API key management system"
   ```

2. **Create your .env file:**
   ```bash
   cp .env.example .env
   # Edit .env with your keys
   ```

3. **Start developing:**
   ```bash
   npm run dev
   ```

## Accessing Settings Later

Once you've completed setup, you can access the API key configuration anytime:

1. Look for a Settings icon/button in your app
2. Or add a button that calls:
   ```javascript
   import { useApiKeyStore } from './stores/apiKeyStore';
   
   function SettingsButton() {
     const { setShowSetupModal } = useApiKeyStore();
     return <button onClick={() => setShowSetupModal(true)}>API Keys</button>;
   }
   ```

## Troubleshooting

### Setup screen won't go away
- Make sure you validated at least one API key successfully
- Check browser console for errors
- Clear sessionStorage and try again

### Keys not persisting
- This is expected! Keys are in sessionStorage (cleared on browser close)
- Use `.env` file for persistent keys during development

### Validation failing
- Check the key format (AIza for Google, sk- for OpenAI, pk. for Mapbox)
- Verify you have quota/credits available
- Check your internet connection

## Production Deployment

For production, use runtime configuration:

1. Build your app:
   ```bash
   npm run build
   ```

2. Edit `dist/config.js` with your production keys

3. Or mount it as a volume in Docker:
   ```bash
   docker run -v $(pwd)/config.js:/app/dist/config.js my-app
   ```

## Need Help?

- Check `API_KEY_SECURITY.md` for detailed security guide
- Review `AI_CHATBOT_SETUP.md` for AI-specific setup
- Open an issue on GitHub

---

**Important:** Never commit your `.env` file! It's now in `.gitignore` and removed from git tracking.
