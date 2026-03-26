/**
 * AI Command Handler Service
 * Processes AI commands from command palette and routes them appropriately
 */

import aiService from '../services/aiService';
import { useChatStore } from '../stores/chatStore';
import { useApiKeyStore } from '../stores/apiKeyStore';
import { trackAICommand, trackApiError, addBreadcrumb } from '../utils/sentry';

export type AICommand = 
  | 'smart-matching'
  | 'dynamic-pricing'
  | 'route-optimizer'
  | 'predictive-analytics'
  | 'demand-prediction'
  | 'chat'
  | 'help'
  | 'status';

export interface AICommandResult {
  success: boolean;
  message: string;
  data?: any;
  action?: {
    type: 'navigate' | 'open-chat' | 'show-notification' | 'open-modal';
    payload?: any;
  };
}

class AICommandHandler {
  /**
   * Handle AI command from command palette
   */
  async handleCommand(command: AICommand, context?: any): Promise<AICommandResult> {
    const startTime = Date.now();
    
    // Add breadcrumb for command start
    addBreadcrumb({
      message: `AI Command: ${command}`,
      category: 'ai.command',
      level: 'info',
      data: { command, context, timestamp: new Date().toISOString() },
    });

    try {
      let result: AICommandResult;

      switch (command) {
        case 'smart-matching':
          result = await this.handleSmartMatching();
          break;
        
        case 'dynamic-pricing':
          result = await this.handleDynamicPricing();
          break;
        
        case 'route-optimizer':
          result = await this.handleRouteOptimization();
          break;
        
        case 'predictive-analytics':
          result = await this.handlePredictiveAnalytics();
          break;
        
        case 'demand-prediction':
          result = await this.handleDemandPrediction();
          break;
        
        case 'chat':
          result = this.handleChat();
          break;
        
        case 'help':
          result = this.handleHelp();
          break;
        
        case 'status':
          result = await this.handleStatus();
          break;
        
        default:
          result = {
            success: false,
            message: `Unknown command: ${command}`
          };
      }

      // Track successful command
      trackAICommand(command, true);
      
      // Add performance tracking
      const duration = Date.now() - startTime;
      addBreadcrumb({
        message: `AI Command completed: ${command}`,
        category: 'ai.command',
        level: 'info',
        data: { command, duration, success: result.success },
      });

      return result;
    } catch (error) {
      console.error('AI Command Handler Error:', error);
      
      // Track failed command
      trackAICommand(command, false, error instanceof Error ? error.message : 'Unknown error');
      
      // Track API error if it's an API-related error
      if (error instanceof Error && (error.message.includes('API') || error.message.includes('fetch'))) {
        trackApiError('ai-command', error);
      }

      return {
        success: false,
        message: `Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Handle smart matching command
   */
  private async handleSmartMatching(): Promise<AICommandResult> {
    const apiKeyStore = useApiKeyStore.getState();
    const hasOpenAI = !!apiKeyStore.getKey('openAI');
    
    if (!hasOpenAI) {
      return {
        success: false,
        message: 'OpenAI API key required for smart matching',
        action: {
          type: 'show-notification',
          payload: {
            severity: 'warning',
            message: 'Please configure your OpenAI API key in Settings'
          }
        }
      };
    }

    // Mock matching data for demo
    const mockDrivers = [
      {
        id: 'driver-1',
        name: 'John Doe',
        rating: 4.8,
        location: { lat: 40.7589, lng: -73.9441 },
        vehicleType: 'sedan',
        available: true,
        eta: 3
      },
      {
        id: 'driver-2',
        name: 'Jane Smith',
        rating: 4.9,
        location: { lat: 40.7489, lng: -73.9541 },
        vehicleType: 'suv',
        available: true,
        eta: 5
      }
    ];

    const mockPassenger = {
      pickup: { lat: 40.7589, lng: -73.9441 },
      destination: { lat: 40.7789, lng: -73.9341 },
      vehicleType: 'sedan',
      passengers: 2
    };

    try {
      const result = await aiService.matchDriverPassenger(mockDrivers, mockPassenger);
      
      return {
        success: true,
        message: `Found ${result.matches.length} matching drivers`,
        data: result,
        action: {
          type: 'navigate',
          payload: '/dashboard/ai-demo?feature=smart-matching'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Smart matching temporarily unavailable',
        data: mockDrivers.slice(0, 1) // Fallback
      };
    }
  }

  /**
   * Handle dynamic pricing command
   */
  private async handleDynamicPricing(): Promise<AICommandResult> {
    const mockPricingContext = {
      distance: 5.2,
      estimatedTime: 15,
      pickup: { lat: 40.7589, lng: -73.9441 },
      destination: { lat: 40.7789, lng: -73.9341 },
      time: new Date(),
      passengers: 2
    };

    try {
      const result = await aiService.calculateDynamicPrice(mockPricingContext);
      
      return {
        success: true,
        message: `Dynamic price calculated: $${result.finalPrice?.toFixed(2)}`,
        data: result,
        action: {
          type: 'navigate',
          payload: '/dashboard/ai-demo?feature=dynamic-pricing'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Dynamic pricing temporarily unavailable',
        data: { finalPrice: 15.00, surgeMultiplier: 1.2 } // Fallback
      };
    }
  }

  /**
   * Handle route optimization command
   */
  private async handleRouteOptimization(): Promise<AICommandResult> {
    const mockWaypoints = [
      { lat: 40.7589, lng: -73.9441 },
      { lat: 40.7789, lng: -73.9341 }
    ];

    const mockPreferences = {
      prioritizeTime: true,
      avoidTolls: false,
      ecoFriendly: false
    };

    try {
      const result = await aiService.optimizeRoute(mockWaypoints, mockPreferences);
      
      return {
        success: true,
        message: 'Route optimized successfully',
        data: result,
        action: {
          type: 'navigate',
          payload: '/dashboard/ai-demo?feature=route-optimizer'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Route optimization temporarily unavailable',
        data: { estimatedTime: 15, estimatedDistance: 5.0 } // Fallback
      };
    }
  }

  /**
   * Handle predictive analytics command
   */
  private async handlePredictiveAnalytics(): Promise<AICommandResult> {
    try {
      const result = await aiService.getPredictiveAnalytics();
      
      return {
        success: true,
        message: 'Analytics data loaded',
        data: result,
        action: {
          type: 'navigate',
          payload: '/dashboard/ai-demo?feature=predictive-analytics'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Analytics temporarily unavailable',
        data: {
          revenue: { today: { projected: 15000, actual: 12000 } },
          utilization: { current: 0.75, peak: 0.92 }
        } // Fallback
      };
    }
  }

  /**
   * Handle demand prediction command
   */
  private async handleDemandPrediction(): Promise<AICommandResult> {
    const mockLocation = { lat: 40.7589, lng: -73.9441 };

    try {
      const result = await aiService.predictDemand(mockLocation);
      
      return {
        success: true,
        message: 'Demand prediction completed',
        data: result,
        action: {
          type: 'navigate',
          payload: '/dashboard/ai-demo?feature=demand-prediction'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Demand prediction temporarily unavailable',
        data: {
          currentDemand: 0.75,
          predictions: [
            { hour: 14, demand: 0.7 },
            { hour: 15, demand: 0.8 }
          ]
        } // Fallback
      };
    }
  }

  /**
   * Handle chat command
   */
  private handleChat(): AICommandResult {
    const chatStore = useChatStore.getState();
    
    // Create or get active conversation
    if (!chatStore.activeConversationId) {
      chatStore.createConversation();
    }

    return {
      success: true,
      message: 'AI Assistant ready',
      action: {
        type: 'open-chat',
        payload: {
          message: 'Hello! I\'m your AI assistant. How can I help you with your rideshare operations today?'
        }
      }
    };
  }

  /**
   * Handle help command
   */
  private handleHelp(): AICommandResult {
    const helpText = `
Available AI Commands:
• Smart Matching - AI-powered driver-passenger matching
• Dynamic Pricing - Real-time surge pricing calculator
• Route Optimization - AI-optimized route planning
• Predictive Analytics - Business forecasting insights
• Demand Prediction - Location-based demand forecasting
• Chat - Talk to AI assistant

Keyboard Shortcuts:
• Ctrl+K (Cmd+K) - Open command palette
• Ctrl+/ (Cmd+/) - Open AI chat

Tips:
• Configure API keys in Settings for full functionality
• Use natural language in chat for complex queries
• Check AI Cost Tracker for usage monitoring
    `.trim();

    return {
      success: true,
      message: 'Help information loaded',
      data: { helpText },
      action: {
        type: 'open-chat',
        payload: {
          message: helpText
        }
      }
    };
  }

  /**
   * Handle status command
   */
  private async handleStatus(): Promise<AICommandResult> {
    const apiKeyStore = useApiKeyStore.getState();
    const chatStore = useChatStore.getState();
    
    const status = {
      openAI: !!apiKeyStore.getKey('openAI'),
      googleAI: !!apiKeyStore.getKey('googleAI'),
      mapbox: !!apiKeyStore.getKey('mapbox'),
      activeConversations: chatStore.conversations.length,
      totalMessages: chatStore.getTotalMessages?.() || 0,
      services: {
        smartMatching: aiService.isServiceAvailable('openai'),
        dynamicPricing: aiService.isServiceAvailable('openai'),
        routeOptimization: aiService.isServiceAvailable('mapbox'),
        predictiveAnalytics: aiService.isServiceAvailable('openai')
      }
    };

    const availableServices = Object.values(status.services).filter(Boolean).length;
    const totalServices = Object.keys(status.services).length;

    return {
      success: true,
      message: `${availableServices}/${totalServices} AI services available`,
      data: status,
      action: {
        type: 'show-notification',
        payload: {
          severity: availableServices > 2 ? 'success' : 'warning',
          message: `${availableServices}/${totalServices} AI services configured`
        }
      }
    };
  }

  /**
   * Get available commands based on current configuration
   */
  getAvailableCommands(): { command: AICommand; label: string; description: string; available: boolean }[] {
    const apiKeyStore = useApiKeyStore.getState();
    const hasOpenAI = !!apiKeyStore.getKey('openAI');
    const hasGoogleAI = !!apiKeyStore.getKey('googleAI');
    const hasMapbox = !!apiKeyStore.getKey('mapbox');

    return [
      {
        command: 'chat',
        label: 'Ask AI Assistant',
        description: 'Chat with AI about anything',
        available: hasGoogleAI || hasOpenAI
      },
      {
        command: 'smart-matching',
        label: 'Smart Driver Matching',
        description: 'AI-powered driver-passenger matching',
        available: hasOpenAI
      },
      {
        command: 'dynamic-pricing',
        label: 'Dynamic Pricing',
        description: 'AI surge pricing calculator',
        available: hasOpenAI
      },
      {
        command: 'route-optimizer',
        label: 'Route Optimization',
        description: 'AI-optimized route planning',
        available: hasOpenAI && hasMapbox
      },
      {
        command: 'predictive-analytics',
        label: 'Predictive Analytics',
        description: 'AI business forecasting',
        available: hasOpenAI
      },
      {
        command: 'demand-prediction',
        label: 'Demand Prediction',
        description: 'Location-based demand forecasting',
        available: hasOpenAI
      },
      {
        command: 'status',
        label: 'AI Status',
        description: 'Check AI service availability',
        available: true
      },
      {
        command: 'help',
        label: 'Help',
        description: 'Show available commands and tips',
        available: true
      }
    ];
  }
}

// Export singleton instance
export default new AICommandHandler();
