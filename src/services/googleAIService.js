// Google AI Service - Real integration with Google Gemini API
// 
// This service integrates with Google's Gemini AI model (gemini-2.5-flash by default)
// to provide intelligent chat responses for the rideshare platform.
//
// Configuration:
// - GOOGLE_AI_API_KEY: Your Google AI API key (get from https://makersuite.google.com/app/apikey)
// - GOOGLE_AI_MODEL: The model to use (default: gemini-2.5-flash)
//
// Features:
// - Real-time chat with Google Gemini AI
// - Conversation history management per conversation ID
// - Contextual responses tailored for rideshare platform
// - Automatic fallback to mock responses if API is unavailable
//
import { GoogleGenerativeAI } from '@google/generative-ai';

class GoogleAIService {
  constructor() {
    this.apiKey = import.meta.env.GOOGLE_AI_API_KEY;
    this.modelName = import.meta.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash';
    this.genAI = null;
    this.model = null;
    this.chat = null;
    this.conversationHistory = new Map();
  }

  initialize() {
    if (!this.apiKey || this.apiKey === 'your_google_ai_api_key_here') {
      console.warn('Google AI API key not configured. Using mock responses.');
      return false;
    }

    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: this.modelName });
      return true;
    } catch (error) {
      console.error('Failed to initialize Google AI:', error);
      return false;
    }
  }

  async sendChatMessage(message, conversationId = 'default') {
    // Initialize if not already done
    if (!this.genAI) {
      const initialized = this.initialize();
      if (!initialized) {
        return this.getMockResponse(message);
      }
    }

    try {
      // Get or create chat session for this conversation
      let chat = this.conversationHistory.get(conversationId);
      
      if (!chat) {
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

      // Add context about the rideshare platform
      const contextualMessage = this.addRideshareContext(message);

      // Send message and get response
      const result = await chat.sendMessage(contextualMessage);
      const response = result.response;
      const text = response.text();

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
        console.error('Invalid API key. Please check your GOOGLE_AI_API_KEY environment variable.');
      } else if (error.message?.includes('quota')) {
        console.error('API quota exceeded. Please check your Google AI usage limits.');
      }
      
      // Fallback to mock response
      return this.getMockResponse(message);
    }
  }

  addRideshareContext(message) {
    // Add context about the rideshare platform to help the AI provide relevant responses
    const context = `You are an AI assistant for a rideshare platform. You help users with:
- Booking rides
- Tracking drivers
- Getting fare estimates
- Managing trips and payments
- Answering questions about the service

User message: ${message}

Provide a helpful, concise response. Keep it friendly and professional.`;
    
    return context;
  }

  generateSuggestions(userMessage, aiResponse) {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();

    // Generate contextual suggestions based on the conversation
    if (lowerMessage.includes('book') || lowerMessage.includes('ride')) {
      return ['Get fare estimate', 'Choose vehicle type', 'Schedule for later', 'Add stops'];
    } else if (lowerMessage.includes('track') || lowerMessage.includes('driver')) {
      return ['Call driver', 'Share trip', 'View route', 'Cancel trip'];
    } else if (lowerMessage.includes('fare') || lowerMessage.includes('price')) {
      return ['Book this ride', 'Compare prices', 'View breakdown', 'Apply promo code'];
    } else if (lowerMessage.includes('cancel')) {
      return ['Yes, cancel', 'No, keep ride', 'Contact support', 'View policy'];
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('card')) {
      return ['Add payment method', 'Update card', 'View receipts', 'Payment history'];
    } else if (lowerResponse.includes('book') || lowerResponse.includes('ride')) {
      return ['Book a ride', 'Get fare estimate', 'View nearby drivers', 'Schedule ride'];
    } else {
      return ['Book a ride', 'Track driver', 'Fare estimate', 'Help & Support'];
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
