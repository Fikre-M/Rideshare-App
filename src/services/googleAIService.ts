/**
 * Google AI Service — routes all requests through the server-side proxy.
 * API keys never touch the browser.
 */

const PROXY_BASE = import.meta.env.VITE_AI_PROXY_URL || '/api/ai';

interface ConversationPart {
  text: string;
}

interface ConversationTurn {
  role: 'user' | 'model';
  parts: ConversationPart[];
}

interface ChatResponse {
  response: string;
  confidence: number;
  suggestions: string[];
  timestamp: string;
  model: string;
}

class GoogleAIService {
  private conversationHistory: Map<string, ConversationTurn[]>;

  constructor() {
    this.conversationHistory = new Map();
  }

  async sendChatMessage(message: string, conversationId = 'default'): Promise<ChatResponse> {
    const history = this.conversationHistory.get(conversationId) || [];

    try {
      const res = await fetch(`${PROXY_BASE}/google/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history,
          modelName: import.meta.env.VITE_GOOGLE_AI_MODEL || 'gemini-2.5-flash',
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
        throw new Error(err.error || `Proxy error ${res.status}`);
      }

      const { text } = await res.json() as { text: string };

      history.push(
        { role: 'user', parts: [{ text: message }] },
        { role: 'model', parts: [{ text }] }
      );
      this.conversationHistory.set(conversationId, history);

      return {
        response: text,
        confidence: 0.9,
        suggestions: this.generateSuggestions(message, text),
        timestamp: new Date().toISOString(),
        model: import.meta.env.VITE_GOOGLE_AI_MODEL || 'gemini-2.5-flash',
      };
    } catch (error) {
      console.error('Google AI proxy error:', error);
      return this.getMockResponse(message);
    }
  }

  generateSuggestions(userMessage: string, aiResponse: string): string[] {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();

    if (lowerMessage.includes('weather') || lowerResponse.includes('weather')) {
      return ['Weather forecast', 'Temperature today', 'Weather alerts', 'Weekly forecast'];
    } else if (lowerMessage.includes('book') || lowerMessage.includes('ride')) {
      return ['Get fare estimate', 'Choose vehicle type', 'Schedule for later', 'Add stops'];
    } else if (lowerMessage.includes('track') || lowerMessage.includes('driver')) {
      return ['Call driver', 'Share trip', 'View route', 'Cancel trip'];
    } else if (lowerMessage.includes('fare') || lowerMessage.includes('price')) {
      return ['Book this ride', 'Compare prices', 'View breakdown', 'Apply promo code'];
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('card')) {
      return ['Add payment method', 'Update card', 'View receipts', 'Payment history'];
    } else {
      return ['Tell me more', 'How does it work?', 'Show examples', 'What else can you do?'];
    }
  }

  clearConversation(conversationId = 'default'): void {
    this.conversationHistory.delete(conversationId);
  }

  clearAllConversations(): void {
    this.conversationHistory.clear();
  }

  getMockResponse(message: string): ChatResponse {
    const lowerMessage = message.toLowerCase();
    let response = '';
    let suggestions = ['Book a ride', 'Track my driver', 'Cancel trip', 'Fare estimate'];

    if (lowerMessage.includes('book') || lowerMessage.includes('ride')) {
      response = '🚗 I can help you book a ride! Where would you like to go?';
      suggestions = ['Downtown to Airport', 'Home to Office', 'Mall to Restaurant', 'Get fare estimate'];
    } else if (lowerMessage.includes('driver') || lowerMessage.includes('track')) {
      response = "📍 Your driver is 3 minutes away! I'll send you live updates.";
      suggestions = ['Call driver', 'Share trip', 'View route', 'Cancel trip'];
    } else if (lowerMessage.includes('fare') || lowerMessage.includes('price')) {
      response = '💰 Estimated fare: $12–15 based on current demand and distance.';
      suggestions = ['Book this ride', 'Compare prices', 'View breakdown', 'Apply promo code'];
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = "👋 Hello! I'm your AI rideshare assistant. How can I help you today?";
      suggestions = ['Book a ride', 'Track my driver', 'Fare estimate', 'View trip history'];
    } else {
      response = "🤖 I'm here to help with your ride needs! What would you like to do?";
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
