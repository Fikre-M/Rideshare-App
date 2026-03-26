/**
 * AI Validation Utilities
 * Functions for validating and sanitizing AI inputs/outputs
 */

export interface AIResponse {
  text: string;
  suggestions?: string[];
  confidence?: number;
  isError?: boolean;
  source?: string;
}

export interface AIInput {
  message: string;
  context?: Record<string, any>;
  preferences?: Record<string, any>;
}

/**
 * Validate AI response structure and content
 */
export const validateAIResponse = (response: any): boolean => {
  if (!response || typeof response !== 'object') {
    return false;
  }

  // Must have text property
  if (!response.text || typeof response.text !== 'string') {
    return false;
  }

  // Text should not be empty
  if (response.text.trim().length === 0) {
    return false;
  }

  // If suggestions exist, should be an array
  if (response.suggestions && !Array.isArray(response.suggestions)) {
    return false;
  }

  // If confidence exists, should be a number between 0 and 1
  if (response.confidence !== undefined) {
    if (typeof response.confidence !== 'number' || response.confidence < 0 || response.confidence > 1) {
      return false;
    }
  }

  return true;
};

/**
 * Sanitize user input for AI processing
 */
export const sanitizeAIInput = (input: string | null | undefined): string => {
  if (!input) return '';

  // Remove HTML tags (including content inside script tags)
  let sanitized = input.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove potentially dangerous characters but preserve normal punctuation
  sanitized = sanitized.replace(/[<>@#$%^&*()+=\[\]{}|\\:"'<>]/g, '');

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Limit length to prevent token abuse
  const maxLength = 5000;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

/**
 * Extract suggestions from AI response
 */
export const extractAISuggestions = (response: AIResponse): string[] => {
  const suggestions: string[] = [];

  // If suggestions array is provided
  if (response.suggestions && Array.isArray(response.suggestions)) {
    suggestions.push(...response.suggestions.filter(s => typeof s === 'string' && s.trim().length > 0));
  }

  // Try to extract suggestions from text
  if (response.text) {
    // Look for numbered lists
    const numberedMatches = response.text.match(/\d+\.\s+([^.\n]+)/g);
    if (numberedMatches) {
      numberedMatches.forEach(match => {
        const suggestion = match.replace(/^\d+\.\s+/, '').trim();
        if (suggestion && !suggestions.includes(suggestion)) {
          suggestions.push(suggestion);
        }
      });
    }

    // Look for bullet points
    const bulletMatches = response.text.match(/[•·-]\s+([^.\n]+)/g);
    if (bulletMatches) {
      bulletMatches.forEach(match => {
        const suggestion = match.replace(/^[•·-]\s+/, '').trim();
        if (suggestion && !suggestions.includes(suggestion)) {
          suggestions.push(suggestion);
        }
      });
    }
  }

  // Remove duplicates and limit to reasonable number
  return Array.from(new Set(suggestions)).slice(0, 5);
};

/**
 * Check if AI response indicates an error
 */
export const isAIErrorResponse = (response: AIResponse): boolean => {
  return !!(
    response.isError ||
    response.text.toLowerCase().includes('error') ||
    response.text.toLowerCase().includes('sorry') ||
    response.text.toLowerCase().includes('unable')
  );
};

/**
 * Filter inappropriate content
 */
export const filterInappropriateContent = (text: string): string => {
  // Basic profanity filter (can be expanded)
  const inappropriateWords = ['damn', 'hell', 'stupid', 'idiot'];
  
  let filtered = text;
  inappropriateWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });

  return filtered;
};

/**
 * Validate AI input structure
 */
export const validateAIInput = (input: any): boolean => {
  if (!input || typeof input !== 'object') {
    return false;
  }

  // Must have message property
  if (!input.message || typeof input.message !== 'string') {
    return false;
  }

  // Message should not be empty after sanitization
  const sanitized = sanitizeAIInput(input.message);
  if (sanitized.length === 0) {
    return false;
  }

  return true;
};

/**
 * Get response quality score
 */
export const getResponseQualityScore = (response: AIResponse): number => {
  let score = 0;

  // Base score for having text
  if (response.text && response.text.length > 0) {
    score += 20;
  }

  // Length score (optimal length is 50-300 characters)
  if (response.text.length >= 50 && response.text.length <= 300) {
    score += 20;
  } else if (response.text.length > 10) {
    score += 10;
  }

  // Suggestions score
  if (response.suggestions && response.suggestions.length > 0) {
    score += Math.min(response.suggestions.length * 10, 30);
  }

  // Confidence score
  if (response.confidence && response.confidence > 0.7) {
    score += 20;
  } else if (response.confidence && response.confidence > 0.5) {
    score += 10;
  }

  // Error penalty
  if (isAIErrorResponse(response)) {
    score -= 30;
  }

  return Math.max(0, Math.min(100, score));
};
