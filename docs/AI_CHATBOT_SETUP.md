# AI Chatbot Setup Guide

## Overview
The AI chatbot is now integrated with **Google Gemini AI (gemini-2.5-flash)** and can answer ANY question - not just rideshare-specific ones!

## Features
- ✅ Real-time chat with Google Gemini AI
- ✅ Can answer questions about weather, news, math, coding, general knowledge, etc.
- ✅ Conversation history management
- ✅ Context-aware suggestions
- ✅ Automatic fallback to mock responses if API is unavailable

## Setup Instructions

### 1. Get Your Google AI API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

**Important:** The free tier has a limit of 20 requests per day. For production use, consider upgrading to a paid tier.

### 2. Configure Environment Variables
Your `.env` file should already have:
```env
VITE_GOOGLE_AI_API_KEY=AIzaSyDo88X11485r6O0XCUG6EacxGtZ0cYWUY4
VITE_GOOGLE_AI_MODEL=gemini-2.5-flash
```

If you need to change the API key, edit the `.env` file.

### 3. Restart Dev Server (IMPORTANT!)
After adding or changing environment variables, you MUST restart the dev server:

```bash
# Stop the current server (Ctrl+C)
# Then start it again:
npm run dev
```

### 4. Verify Setup
Run the environment checker:
```bash
node check-env.js
```

This will verify that your environment variables are configured correctly.

### 5. Test the Chatbot
1. Open the app in your browser
2. Click the floating chat button (bottom right)
3. Try asking any question:
   - "What's the weather in NYC?"
   - "What is 100 + 12?"
   - "Explain quantum physics"
   - "Help me book a ride"

## Troubleshooting

### Issue: "API Quota Exceeded" or 429 Error

**Cause:** The free tier of Google Gemini API has a limit of 20 requests per day per project.

**Solutions:**
1. **Wait 24 hours** - Your quota will automatically reset
2. **Create a new API key:**
   - Go to https://makersuite.google.com/app/apikey
   - Create a new project
   - Generate a new API key
   - Update your `.env` file with the new key
   - Restart the dev server
3. **Upgrade to paid tier:**
   - Visit https://console.cloud.google.com/
   - Enable billing for your project
   - Get much higher rate limits (1500 requests per day or more)
4. **Use a different model:**
   - Try `gemini-1.5-flash` or `gemini-1.5-pro` in your `.env` file
   - Different models may have different quota limits

**Current Status:**
- Free tier: 20 requests per day
- When quota is exceeded, the chatbot falls back to mock responses
- Check your usage at: https://ai.dev/rate-limit

### Issue: Chatbot gives mock responses instead of real AI responses

**Solution:**
1. Check browser console for error messages
2. Verify API key is set: `node check-env.js`
3. **Restart the dev server** (most common issue!)
4. Check that your API key is valid

### Issue: "API key not configured" error

**Solution:**
1. Make sure `VITE_GOOGLE_AI_API_KEY` is in your `.env` file
2. Make sure the variable name starts with `VITE_` (required by Vite)
3. Restart the dev server

### Issue: "API quota exceeded" error

**Solution:**
1. Check your Google AI usage limits
2. Wait for quota to reset
3. Consider upgrading your Google AI plan

## Browser Console Logs

When the chatbot initializes, you should see:
```
=== Google AI Service Initialization ===
API Key: AIzaSyDo88...
Model: gemini-2.5-flash
=======================================
```

When sending a message:
```
Initializing Google AI...
✅ Creating Google AI client...
✅ Google AI initialized successfully!
Sending message to Google AI: [your message]
Received response from Google AI
```

If you see "❌ Google AI API key not configured", restart your dev server!

## Files Modified
- `src/services/googleAIService.js` - Google AI integration
- `src/services/aiService.js` - Uses Google AI for chat
- `src/components/ai/ChatBot.jsx` - Chatbot UI component
- `src/stores/chatStore.js` - Chat state management
- `.env` - Environment variables
- `.env.example` - Environment variable template

## Support
If you continue to have issues:
1. Check the browser console for detailed error messages
2. Run `node check-env.js` to verify configuration
3. Make sure you've restarted the dev server
4. Verify your API key is valid at https://makersuite.google.com/app/apikey
