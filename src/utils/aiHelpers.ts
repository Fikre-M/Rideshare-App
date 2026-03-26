/**
 * AI Helper Utilities
 * Common functions for AI features
 */

// Token pricing (per 1K tokens as of 2024)
const TOKEN_PRICING = {
  'gpt-4': 0.03,      // $0.03 per 1K tokens
  'gpt-3.5-turbo': 0.001, // $0.001 per 1K tokens
  'gemini-pro': 0.0005,   // $0.0005 per 1K tokens
  'claude-3': 0.015,    // $0.015 per 1K tokens
  'default': 0.002      // Default rate
};

/**
 * Calculate AI token cost based on model
 */
export const calculateAITokenCost = (tokens: number, model: keyof typeof TOKEN_PRICING | string = 'default'): number => {
  if (tokens <= 0) return 0;
  
  const rate = TOKEN_PRICING[model as keyof typeof TOKEN_PRICING] || TOKEN_PRICING.default;
  return (tokens / 1000) * rate;
};

/**
 * Format token count for display
 */
export const formatTokenCount = (tokens: number): string => {
  if (tokens < 1000) return tokens.toString();
  if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
  return `${(tokens / 1000000).toFixed(1)}M`;
};

/**
 * Estimate tokens for text input (rough approximation)
 */
export const estimateTokenCount = (text: string): number => {
  // Rough approximation: ~4 characters per token
  return Math.ceil(text.length / 4);
};

/**
 * Get model display name
 */
export const getModelDisplayName = (model: string): string => {
  const modelNames: Record<string, string> = {
    'gpt-4': 'GPT-4',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'gemini-pro': 'Gemini Pro',
    'claude-3': 'Claude 3',
    'gemini-2.5-flash': 'Gemini 2.5 Flash'
  };
  
  return modelNames[model] || model;
};

/**
 * Check if cost exceeds budget
 */
export const isOverBudget = (cost: number, budget: number): boolean => {
  return cost > budget;
};

/**
 * Get cost tier based on usage
 */
export const getCostTier = (monthlyCost: number): 'low' | 'medium' | 'high' | 'enterprise' => {
  if (monthlyCost < 10) return 'low';
  if (monthlyCost < 100) return 'medium';
  if (monthlyCost < 1000) return 'high';
  return 'enterprise';
};
