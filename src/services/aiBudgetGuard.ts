// @ts-nocheck
// AI Budget Guard Service - Tracks and limits AI API costs
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// GPT-4o pricing (as of 2024)
const PRICING = {
  'gpt-4o': {
    input: 5 / 1_000_000,  // $5 per 1M input tokens
    output: 15 / 1_000_000, // $15 per 1M output tokens
  },
  'gpt-4o-mini': {
    input: 0.15 / 1_000_000,  // $0.15 per 1M input tokens
    output: 0.60 / 1_000_000, // $0.60 per 1M output tokens
  },
  'gpt-3.5-turbo': {
    input: 0.50 / 1_000_000,  // $0.50 per 1M input tokens
    output: 1.50 / 1_000_000, // $1.50 per 1M output tokens
  },
};

// Default budget limit
const DEFAULT_BUDGET_LIMIT = 0.50; // $0.50 per session

// Budget store with persistence
export const useBudgetStore = create(
  persist(
    (set, get) => ({
      // Session tracking
      sessionCost: 0,
      sessionTokens: {
        input: 0,
        output: 0,
        total: 0,
      },
      
      // Feature breakdown
      costByFeature: {},
      
      // Budget settings
      budgetLimit: DEFAULT_BUDGET_LIMIT,
      budgetEnabled: true,
      budgetExceeded: false,
      
      // Warnings
      warningThreshold: 0.8, // Warn at 80% of budget
      warningShown: false,
      
      // Session metadata
      sessionStartTime: Date.now(),
      lastResetTime: Date.now(),
      
      // Actions
      trackUsage: (feature, usage, model = 'gpt-4o') => {
        if (!usage) return;
        
        const pricing = PRICING[model] || PRICING['gpt-4o'];
        const inputCost = (usage.prompt_tokens || 0) * pricing.input;
        const outputCost = (usage.completion_tokens || 0) * pricing.output;
        const totalCost = inputCost + outputCost;
        
        set((state) => {
          const newSessionCost = state.sessionCost + totalCost;
          const newCostByFeature = {
            ...state.costByFeature,
            [feature]: (state.costByFeature[feature] || 0) + totalCost,
          };
          
          const newSessionTokens = {
            input: state.sessionTokens.input + (usage.prompt_tokens || 0),
            output: state.sessionTokens.output + (usage.completion_tokens || 0),
            total: state.sessionTokens.total + (usage.total_tokens || 0),
          };
          
          const budgetExceeded = state.budgetEnabled && newSessionCost >= state.budgetLimit;
          const warningShown = newSessionCost >= (state.budgetLimit * state.warningThreshold);
          
          return {
            sessionCost: newSessionCost,
            sessionTokens: newSessionTokens,
            costByFeature: newCostByFeature,
            budgetExceeded,
            warningShown,
          };
        });
      },
      
      setBudgetLimit: (limit) => set({ budgetLimit: limit }),
      
      setBudgetEnabled: (enabled) => set({ budgetEnabled: enabled }),
      
      setWarningThreshold: (threshold) => set({ warningThreshold: threshold }),
      
      resetSession: () => set({
        sessionCost: 0,
        sessionTokens: { input: 0, output: 0, total: 0 },
        costByFeature: {},
        budgetExceeded: false,
        warningShown: false,
        sessionStartTime: Date.now(),
        lastResetTime: Date.now(),
      }),
      
      canMakeRequest: () => {
        const state = get();
        return !state.budgetEnabled || !state.budgetExceeded;
      },
      
      getRemainingBudget: () => {
        const state = get();
        return Math.max(0, state.budgetLimit - state.sessionCost);
      },
      
      getBudgetPercentage: () => {
        const state = get();
        return (state.sessionCost / state.budgetLimit) * 100;
      },
      
      shouldShowWarning: () => {
        const state = get();
        return state.budgetEnabled && 
               state.sessionCost >= (state.budgetLimit * state.warningThreshold) &&
               !state.budgetExceeded;
      },
      
      getStats: () => {
        const state = get();
        return {
          sessionCost: state.sessionCost,
          sessionTokens: state.sessionTokens,
          costByFeature: state.costByFeature,
          budgetLimit: state.budgetLimit,
          remainingBudget: get().getRemainingBudget(),
          budgetPercentage: get().getBudgetPercentage(),
          budgetExceeded: state.budgetExceeded,
          sessionDuration: Date.now() - state.sessionStartTime,
        };
      },
    }),
    {
      name: 'ai-budget-storage',
      // Reset session on page reload (don't persist session data)
      partialize: (state) => ({
        budgetLimit: state.budgetLimit,
        budgetEnabled: state.budgetEnabled,
        warningThreshold: state.warningThreshold,
      }),
    }
  )
);

// Budget Guard Service
class AIBudgetGuard {
  constructor() {
    this.store = useBudgetStore;
  }
  
  // Track AI usage
  trackUsage(feature, usage, model = 'gpt-4o') {
    this.store.getState().trackUsage(feature, usage, model);
  }
  
  // Check if request can be made
  canMakeRequest() {
    return this.store.getState().canMakeRequest();
  }
  
  // Get budget stats
  getStats() {
    return this.store.getState().getStats();
  }
  
  // Check if warning should be shown
  shouldShowWarning() {
    return this.store.getState().shouldShowWarning();
  }
  
  // Reset session
  resetSession() {
    this.store.getState().resetSession();
  }
  
  // Configure budget
  configure(options = {}) {
    const { limit, enabled, warningThreshold } = options;
    
    if (limit !== undefined) {
      this.store.getState().setBudgetLimit(limit);
    }
    
    if (enabled !== undefined) {
      this.store.getState().setBudgetEnabled(enabled);
    }
    
    if (warningThreshold !== undefined) {
      this.store.getState().setWarningThreshold(warningThreshold);
    }
  }
  
  // Format cost for display
  formatCost(cost) {
    return `$${cost.toFixed(4)}`;
  }
  
  // Format tokens for display
  formatTokens(tokens) {
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  }
}

export default new AIBudgetGuard();
