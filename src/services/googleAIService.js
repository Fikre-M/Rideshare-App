// Google AI Service - Real integration with Google Gemini API
// 
// This service integrates with Google's Gemini AI model (gemini-2.5-flash by default)
// to provide intelligent chat responses for any topic.
//
// Configuration:
// - VITE_GOOGLE_AI_API_KEY: Your Google AI API key (get from https://makersuite.google.com/app/apikey)
// - VITE_GOOGLE_AI_MODEL: The model to use (default: gemini-2.5-flash)
//
// Features:
// - Real-time chat with Google Gemini AI
// - Can answer ANY question (weather, news, math, coding, general knowledge, etc.)
// - Conversation history management per conversation ID
// - Context-aware suggestions based on conversation
// - Automatic fallback to mock responses if API is unavailable
//
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useApiKeyStore } from '../stores/apiKeyStore';

class GoogleAIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.chat = null;
    this.conversationHistory = new Map();
    this.currentApiKey = null;
    this.currentModel = null;
  }

  getApiKey() {
    // Priority: Store > Runtime Config > Env
    const storeKey = useApiKeyStore.getState().getKey('googleAI');
    if (storeKey && storeKey !== 'your_google_ai_api_key_here') {
      return storeKey;
    }
    
    const runtimeKey = window.APP_CONFIG?.googleAIApiKey;
    if (runtimeKey && runtimeKey !== 'your_google_ai_api_key_here') {
      return runtimeKey;
    }
    
    const envKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    if (envKey && envKey !== 'your_google_ai_api_key_here') {
      return envKey;
    }
    
    return null;
  }

  getModel() {
    const storeModel = useApiKeyStore.getState().getKey('googleAIModel');
    if (storeModel) return storeModel;
    
    return window.APP_CONFIG?.googleAIModel || import.meta.env.VITE_GOOGLE_AI_MODEL || 'gemini-2.5-flash';
  }

  initialize() {
    const apiKey = this.getApiKey();
    const modelName = this.getModel();
    
    console.log('=== Initializing Google AI ===');
    console.log('API Key check:', {
      exists: !!apiKey,
      value: apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined/null',
      isPlaceholder: apiKey === 'your_google_ai_api_key_here'
    });
    
    if (!apiKey || apiKey === 'your_google_ai_api_key_here') {
      console.warn('❌ Google AI API key not configured.');
      console.warn('Please configure via Settings or set VITE_GOOGLE_AI_API_KEY in your .env file.');
      return false;
    }

    // Reinitialize if key or model changed
    if (this.currentApiKey !== apiKey || this.currentModel !== modelName) {
      try {
        console.log('✅ Creating Google AI client...');
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: modelName });
        this.currentApiKey = apiKey;
        this.currentModel = modelName;
        console.log('✅ Google AI initialized successfully!');
        return true;
      } catch (error) {
        console.error('❌ Failed to initialize Google AI:', error);
        return false;
      }
    }
    
    return true;
  }

  async sendChatMessage(message, conversationId = 'default') {
    // Initialize if not already done
    if (!this.genAI) {
      console.log('Initializing Google AI...');
      const initialized = this.initialize();
      if (!initialized) {
        console.warn('Google AI initialization failed, using mock response');
        return this.getMockResponse(message);
      }
      console.log('Google AI initialized successfully');
    }

    try {
      console.log('Sending message to Google AI:', message);
      
      // Get or create chat session for this conversation
      let chat = this.conversationHistory.get(conversationId);
      
      if (!chat) {
        console.log('Creating new chat session for conversation:', conversationId);
        chat = this.model.startChat({
          history: [],
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
          },
        });
        this.conversationHistory.set(conversationId, chat);
      }

      // Send message directly without restrictive context
      const result = await chat.sendMessage(message);
      const response = result.response;
      const text = response.text();

      console.log('Received response from Google AI');

      // Generate suggestions based on the response
      const suggestions = this.generateSuggestions(message, text);

      return {
        response: text,
        confidence: 0.9, // Google AI doesn't provide confidence scores
        suggestions,
        timestamp: new Date().toISOString(),
        model: this.modelName,
      };
    } catch (error) {
      console.error('Google AI API error:', error);
      
      // Check for specific error types
      if (error.message?.includes('API key')) {
        console.error('Invalid API key. Please check your VITE_GOOGLE_AI_API_KEY environment variable.');
      } else if (error.message?.includes('quota') || error.message?.includes('429')) {
        console.error('⚠️ API quota exceeded. The free tier allows 20 requests per day.');
        console.error('Solutions:');
        console.error('1. Wait 24 hours for quota reset');
        console.error('2. Create a new API key at https://makersuite.google.com/app/apikey');
        console.error('3. Upgrade to paid tier for higher limits');
      } else if (error.message?.includes('model')) {
        console.error('Model not found. Please check your VITE_GOOGLE_AI_MODEL environment variable.');
      }
      
      // Fallback to mock response
      console.warn('Falling back to mock response');
      return this.getMockResponse(message);
    }
  }

  generateSuggestions(userMessage, aiResponse) {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();

    // Generate contextual suggestions based on the conversation
    if (lowerMessage.includes('weather') || lowerResponse.includes('weather')) {
      return ['Weather forecast', 'Temperature today', 'Weather alerts', 'Weekly forecast'];
    } else if (lowerMessage.includes('news') || lowerResponse.includes('news')) {
      return ['Latest news', 'Technology news', 'Business news', 'Sports news'];
    } else if (lowerMessage.includes('book') || lowerMessage.includes('ride')) {
      return ['Get fare estimate', 'Choose vehicle type', 'Schedule for later', 'Add stops'];
    } else if (lowerMessage.includes('track') || lowerMessage.includes('driver')) {
      return ['Call driver', 'Share trip', 'View route', 'Cancel trip'];
    } else if (lowerMessage.includes('fare') || lowerMessage.includes('price')) {
      return ['Book this ride', 'Compare prices', 'View breakdown', 'Apply promo code'];
    } else if (lowerMessage.includes('cancel')) {
      return ['Yes, cancel', 'No, keep ride', 'Contact support', 'View policy'];
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('card')) {
      return ['Add payment method', 'Update card', 'View receipts', 'Payment history'];
    } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return ['Tell me more', 'Show examples', 'Explain further', 'What else?'];
    } else if (lowerMessage.includes('calculate') || lowerMessage.includes('math')) {
      return ['Calculate more', 'Show steps', 'Convert units', 'Solve equation'];
    } else if (lowerMessage.includes('code') || lowerMessage.includes('program')) {
      return ['Explain code', 'Debug help', 'Best practices', 'More examples'];
    } else {
      // Generic helpful suggestions
      return ['Tell me more', 'How does it work?', 'Show examples', 'What else can you do?'];
    }
  }

  clearConversation(conversationId = 'default') {
    this.conversationHistory.delete(conversationId);
  }

  clearAllConversations() {
    this.conversationHistory.clear();
  }

  getMockResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    let response = '';
    let suggestions = ['Book a ride', 'Track my driver', 'Cancel trip', 'Fare estimate'];
    
    if (lowerMessage.includes('book') || lowerMessage.includes('ride')) {
      response = '🚗 I can help you book a ride! Where would you like to go? Please provide your pickup location and destination.';
      suggestions = ['Downtown to Airport', 'Home to Office', 'Mall to Restaurant', 'Get fare estimate'];
    } else if (lowerMessage.includes('cancel') || lowerMessage.includes('trip')) {
      response = '❌ I can help you cancel your trip. Let me find your active bookings. Do you want to cancel your current ride?';
      suggestions = ['Yes, cancel ride', 'No, keep ride', 'View my trips', 'Contact driver'];
    } else if (lowerMessage.includes('driver') || lowerMessage.includes('track')) {
      response = '📍 Your driver John is 3 minutes away! 🚙 Vehicle: Blue Toyota Camry (ABC-123). I\'ll send you live updates on their location.';
      suggestions = ['Call driver', 'Share trip', 'View route', 'Cancel trip'];
    } else if (lowerMessage.includes('fare') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      response = '💰 Based on current demand and distance, your estimated fare is $12-15. This includes base fare, distance, and time charges.';
      suggestions = ['Book this ride', 'Compare prices', 'View breakdown', 'Choose vehicle type'];
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = '👋 Hello! I\'m your AI rideshare assistant. I can help you book rides, track drivers, get fare estimates, and manage your trips. What would you like to do?';
      suggestions = ['Book a ride', 'Track my driver', 'Fare estimate', 'View trip history'];
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      response = '🆘 I\'m here to help! I can assist you with:\n• Booking new rides\n• Tracking your current driver\n• Getting fare estimates\n• Managing your trips\n• Answering questions about our service\n\nWhat do you need help with?';
      suggestions = ['Book a ride', 'Track driver', 'Payment issues', 'Account settings'];
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('card')) {
      response = '💳 I can help with payment issues. You can add, remove, or update payment methods in your account settings. What payment issue are you experiencing?';
      suggestions = ['Add payment method', 'Update card', 'Payment failed', 'View receipts'];
    } else if (lowerMessage.includes('account') || lowerMessage.includes('profile')) {
      response = '👤 For account settings, you can update your profile, payment methods, and preferences in the app settings. What would you like to change?';
      suggestions = ['Update profile', 'Change password', 'Payment methods', 'Notification settings'];
    } else {
      response = '🤖 I\'m here to help with your ride needs! I can assist you with booking rides, tracking drivers, fare estimates, and managing your trips. What would you like to do?';
      suggestions = ['Book a ride', 'Track my driver', 'Fare estimate', 'Get help'];
    }

    return {
      response,
      confidence: Math.random() * 0.3 + 0.7,
      suggestions,
      timestamp: new Date().toISOString(),
      model: 'mock',
    };
  }
}

export default new GoogleAIService();
