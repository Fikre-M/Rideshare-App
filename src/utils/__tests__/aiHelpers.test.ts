import { calculateAITokenCost, formatTokenCount } from '../../utils/aiHelpers';

describe('AI Helper Utilities', () => {
  describe('calculateAITokenCost', () => {
    it('should calculate cost for OpenAI GPT-4', () => {
      const tokens = 1000;
      const cost = calculateAITokenCost(tokens, 'gpt-4');
      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThan(1);
    });

    it('should calculate cost for Google Gemini', () => {
      const tokens = 1000;
      const cost = calculateAITokenCost(tokens, 'gemini-pro');
      expect(cost).toBeGreaterThan(0);
    });

    it('should handle zero tokens', () => {
      const cost = calculateAITokenCost(0, 'gpt-4');
      expect(cost).toBe(0);
    });

    it('should handle unknown model with default rate', () => {
      const tokens = 1000;
      const cost = calculateAITokenCost(tokens, 'unknown-model');
      expect(cost).toBe(0.002); // Default rate
    });
  });

  describe('formatTokenCount', () => {
    it('should format small numbers', () => {
      expect(formatTokenCount(500)).toBe('500');
    });

    it('should format thousands', () => {
      expect(formatTokenCount(1500)).toBe('1.5K');
    });

    it('should format millions', () => {
      expect(formatTokenCount(1500000)).toBe('1.5M');
    });

    it('should handle zero', () => {
      expect(formatTokenCount(0)).toBe('0');
    });
  });
});
