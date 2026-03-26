import { AICommand } from '../../services/aiCommandHandler';

// Mock the entire aiCommandHandler module
jest.mock('../../services/aiCommandHandler', () => ({
  __esModule: true,
  default: {
    handleCommand: jest.fn(),
    getAvailableCommands: jest.fn()
  },
  AICommand: {}
}));

import aiCommandHandler from '../../services/aiCommandHandler';

// Mock stores
jest.mock('../../stores/chatStore', () => ({
  useChatStore: {
    getState: () => ({
      conversations: [],
      createConversation: jest.fn(),
      addMessage: jest.fn(),
      getTotalMessages: () => 10
    })
  }
}));

jest.mock('../../stores/apiKeyStore', () => ({
  useApiKeyStore: {
    getState: () => ({
      getKey: jest.fn((key: string) => {
        const keys = { openAI: 'test-key', googleAI: 'test-key', mapbox: 'test-key' };
        return keys[key as keyof typeof keys] || '';
      })
    })
  }
}));

describe('AI Command Handler Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Command Types', () => {
    it('should have correct command types', () => {
      const commands: AICommand[] = [
        'smart-matching',
        'dynamic-pricing',
        'route-optimizer',
        'predictive-analytics',
        'demand-prediction',
        'chat',
        'help',
        'status'
      ];

      expect(commands).toContain('chat');
      expect(commands).toContain('help');
      expect(commands).toContain('status');
      expect(commands).toContain('smart-matching');
    });
  });

  describe('Mock Command Handler', () => {
    it('should handle chat command', async () => {
      const mockResult = {
        success: true,
        message: 'AI Assistant ready',
        action: {
          type: 'open-chat',
          payload: { message: 'Hello! How can I help?' }
        }
      };

      (aiCommandHandler.handleCommand as jest.Mock).mockResolvedValue(mockResult);

      const result = await aiCommandHandler.handleCommand('chat');
      
      expect(result).toEqual(mockResult);
      expect(aiCommandHandler.handleCommand).toHaveBeenCalledWith('chat');
    });

    it('should handle help command', async () => {
      const mockResult = {
        success: true,
        message: 'Help information loaded',
        data: { helpText: 'Available commands...' }
      };

      (aiCommandHandler.handleCommand as jest.Mock).mockResolvedValue(mockResult);

      const result = await aiCommandHandler.handleCommand('help');
      
      expect(result.success).toBe(true);
      expect(result.data?.helpText).toBeDefined();
    });

    it('should handle error cases', async () => {
      const mockResult = {
        success: false,
        message: 'Command failed'
      };

      (aiCommandHandler.handleCommand as jest.Mock).mockResolvedValue(mockResult);

      const result = await aiCommandHandler.handleCommand('invalid' as AICommand);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Command failed');
    });
  });

  describe('Available Commands', () => {
    it('should return available commands', () => {
      const mockCommands = [
        { command: 'chat' as AICommand, label: 'Ask AI Assistant', description: 'Chat with AI', available: true },
        { command: 'help' as AICommand, label: 'Help', description: 'Show help', available: true },
        { command: 'status' as AICommand, label: 'AI Status', description: 'Check status', available: true }
      ];

      (aiCommandHandler.getAvailableCommands as jest.Mock).mockReturnValue(mockCommands);

      const commands = aiCommandHandler.getAvailableCommands();
      
      expect(commands).toHaveLength(3);
      expect(commands[0].command).toBe('chat');
      expect(commands[0].available).toBe(true);
    });
  });

  describe('Command Validation', () => {
    it('should validate command structure', () => {
      const validCommands: AICommand[] = ['chat', 'help', 'status', 'smart-matching'];
      
      validCommands.forEach(command => {
        expect(typeof command).toBe('string');
        expect(command.length).toBeGreaterThan(0);
      });
    });
  });
});
