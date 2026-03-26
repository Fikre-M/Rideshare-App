import { validateAIResponse, sanitizeAIInput, extractAISuggestions } from '../../utils/aiValidation';

describe('AI Validation Utilities', () => {
  describe('validateAIResponse', () => {
    it('should validate successful AI response', () => {
      const response = {
        text: 'Hello! How can I help you today?',
        suggestions: ['Book a ride', 'Check pricing'],
        confidence: 0.95
      };
      
      expect(validateAIResponse(response)).toBe(true);
    });

    it('should reject empty response', () => {
      const response = { text: '', suggestions: [] };
      expect(validateAIResponse(response)).toBe(false);
    });

    it('should reject response without text', () => {
      const response = { suggestions: ['test'] };
      expect(validateAIResponse(response)).toBe(false);
    });

    it('should handle null/undefined responses', () => {
      expect(validateAIResponse(null)).toBe(false);
      expect(validateAIResponse(undefined)).toBe(false);
    });

    it('should validate responses with confidence scores', () => {
      const goodResponse = {
        text: 'Valid response',
        confidence: 0.8
      };
      expect(validateAIResponse(goodResponse)).toBe(true);
      
      const lowConfidenceResponse = {
        text: 'Low confidence response',
        confidence: 0.3
      };
      expect(validateAIResponse(lowConfidenceResponse)).toBe(true); // Still valid, just low confidence
    });
  });

  describe('sanitizeAIInput', () => {
    it('should remove HTML tags', () => {
      const input = 'Hello <script>alert("xss")</script> world';
      const sanitized = sanitizeAIInput(input);
      expect(sanitized).toBe('Hello world');
    });

    it('should remove special characters', () => {
      const input = 'Hello @#$%^&*() world';
      const sanitized = sanitizeAIInput(input);
      expect(sanitized).toBe('Hello world');
    });

    it('should preserve normal text', () => {
      const input = 'Hello, how are you today?';
      const sanitized = sanitizeAIInput(input);
      expect(sanitized).toBe('Hello, how are you today?');
    });

    it('should handle empty strings', () => {
      expect(sanitizeAIInput('')).toBe('');
      expect(sanitizeAIInput(null)).toBe('');
      expect(sanitizeAIInput(undefined)).toBe('');
    });

    it('should limit input length', () => {
      const longInput = 'a'.repeat(10000);
      const sanitized = sanitizeAIInput(longInput);
      expect(sanitized.length).toBeLessThanOrEqual(5000);
    });
  });

  describe('extractAISuggestions', () => {
    it('should extract suggestions from AI response', () => {
      const response = {
        text: 'Here are some suggestions: Book a ride, Check pricing, Contact support',
        suggestions: ['Book a ride', 'Check pricing', 'Contact support']
      };
      
      const extracted = extractAISuggestions(response);
      expect(extracted).toEqual(['Book a ride', 'Check pricing', 'Contact support']);
    });

    it('should extract suggestions from text if no array provided', () => {
      const response = {
        text: 'You can: 1. Book a ride 2. Check pricing 3. Contact support'
      };
      
      const extracted = extractAISuggestions(response);
      expect(extracted.length).toBeGreaterThan(0);
      expect(extracted[0]).toContain('Book a ride');
    });

    it('should return empty array for no suggestions', () => {
      const response = { text: 'No suggestions here' };
      const extracted = extractAISuggestions(response);
      expect(extracted).toEqual([]);
    });

    it('should filter out duplicate suggestions', () => {
      const response = {
        suggestions: ['Book a ride', 'Check pricing', 'Book a ride']
      };
      
      const extracted = extractAISuggestions(response);
      expect(extracted).toEqual(['Book a ride', 'Check pricing']);
    });
  });
});
