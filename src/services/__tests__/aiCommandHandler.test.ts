import aiCommandHandler, { AICommand } from '../../services/aiCommandHandler';

// Mock dependencies
jest.mock('../../services/aiService');
jest.mock('../../stores/chatStore');
jest.mock('../../stores/apiKeyStore');

describe('AI Command Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCommand', () => {
    it('should handle chat command', async () => {
      const result = await aiCommandHandler.handleCommand('chat');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('AI Assistant ready');
      expect(result.action?.type).toBe('open-chat');
      expect(result.action?.payload.message).toContain('AI assistant');
    });

    it('should handle help command', async () => {
      const result = await aiCommandHandler.handleCommand('help');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Help information loaded');
      expect(result.data?.helpText).toContain('Available AI Commands');
      expect(result.action?.type).toBe('open-chat');
    });

    it('should handle status command', async () => {
      const result = await aiCommandHandler.handleCommand('status');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('AI services available');
      expect(result.data).toHaveProperty('services');
      expect(result.action?.type).toBe('show-notification');
    });

    it('should handle unknown command', async () => {
      const result = await aiCommandHandler.handleCommand('unknown' as AICommand);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Unknown command');
    });

    it('should handle smart matching with API key', async () => {
      // Mock API key store to return OpenAI key
      const mockApiKeyStore = {
        getState: () => ({
          getKey: jest.fn((key: string) => key === 'openAI' ? 'test-key' : '')
        })
      };
      require('../../stores/apiKeyStore').useApiKeyStore = mockApiKeyStore;

      // Mock AI service
      const mockAIService = require('../../services/aiService').default;
      mockAIService.matchDriverPassenger = jest.fn().mockResolvedValue({
        matches: [{ driverId: 'driver-1', matchScore: 95 }],
        source: 'openai'
      });

      const result = await aiCommandHandler.handleCommand('smart-matching');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('matching drivers');
      expect(result.action?.type).toBe('navigate');
    });

    it('should handle smart matching without API key', async () => {
      // Mock API key store to return no keys
      const mockApiKeyStore = {
        getState: () => ({
          getKey: jest.fn(() => '')
        })
      };
      require('../../stores/apiKeyStore').useApiKeyStore = mockApiKeyStore;

      const result = await aiCommandHandler.handleCommand('smart-matching');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('OpenAI API key required');
      expect(result.action?.type).toBe('show-notification');
    });
  });

  describe('getAvailableCommands', () => {
    it('should return all available commands', () => {
      // Mock API keys
      const mockApiKeyStore = {
        getState: () => ({
          getKey: jest.fn((key: string) => {
            const keys = { openAI: 'test-key', googleAI: 'test-key', mapbox: 'test-key' };
            return keys[key as keyof typeof keys] || '';
          })
        })
      };
      require('../../stores/apiKeyStore').useApiKeyStore = mockApiKeyStore;

      const commands = aiCommandHandler.getAvailableCommands();
      
      expect(commands).toHaveLength(8);
      expect(commands[0].command).toBe('chat');
      expect(commands[0].available).toBe(true);
    });

    it('should mark commands as unavailable when no API keys', () => {
      // Mock no API keys
      const mockApiKeyStore = {
        getState: () => ({
          getKey: jest.fn(() => '')
        })
      };
      require('../../stores/apiKeyStore').useApiKeyStore = mockApiKeyStore;

      const commands = aiCommandHandler.getAvailableCommands();
      
      // Help and status should always be available
      const helpCommand = commands.find(c => c.command === 'help');
      const statusCommand = commands.find(c => c.command === 'status');
      
      expect(helpCommand?.available).toBe(true);
      expect(statusCommand?.available).toBe(true);
      
      // Commands requiring API keys should be unavailable
      const smartMatchingCommand = commands.find(c => c.command === 'smart-matching');
      expect(smartMatchingCommand?.available).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should handle service errors gracefully', async () => {
      // Mock AI service to throw error
      const mockAIService = require('../../services/aiService').default;
      mockAIService.matchDriverPassenger = jest.fn().mockRejectedValue(new Error('Service error'));

      // Mock API key
      const mockApiKeyStore = {
        getState: () => ({
          getKey: jest.fn((key: string) => key === 'openAI' ? 'test-key' : '')
        })
      };
      require('../../stores/apiKeyStore').useApiKeyStore = mockApiKeyStore;

      const result = await aiCommandHandler.handleCommand('smart-matching');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('temporarily unavailable');
      expect(result.data).toBeDefined(); // Should have fallback data
    });
  });
});
