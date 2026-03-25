// AI Budget Guard Service - Tracks and limits AI API costs
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TokenUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface SessionTokens {
  input: number;
  output: number;
  total: number;
}

interface BudgetStats {
  sessionCost: number;
  sessionTokens: SessionTokens;
  costByFeature: Record<string, number>;
  budgetLimit: number;
  remainingBudget: number;
  budgetPercentage: number;
  budgetExceeded: boolean;
  sessionDuration: number;
}

interface BudgetState {
  sessionCost: number;
  sessionTokens: SessionTokens;
  costByFeature: Record<string, number>;
  budgetLimit: number;
  budgetEnabled: boolean;
  budgetExceeded: boolean;
  warningThreshold: number;
  warningShown: boolean;
  sessionStartTime: number;
  lastResetTime: number;
  trackUsage: (feature: string, usage: TokenUsage, model?: string) => void;
  setBudgetLimit: (limit: number) => void;
  setBudgetEnabled: (enabled: boolean) => void;
  setWarningThreshold: (threshold: number) => void;
  resetSession: () => void;
  canMakeRequest: () => boolean;
  getRemainingBudget: () => number;
  getBudgetPercentage: () => number;
  shouldShowWarning: () => boolean;
  getStats: () => BudgetStats;
}

const PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 5 / 1_000_000, output: 15 / 1_000_000 },
  'gpt-4o-mini': { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000 },
  'gpt-3.5-turbo': { input: 0.50 / 1_000_000, output: 1.50 / 1_000_000 },
};

const DEFAULT_BUDGET_LIMIT = 0.50;

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      sessionCost: 0,
      sessionTokens: { input: 0, output: 0, total: 0 },
      costByFeature: {},
      budgetLimit: DEFAULT_BUDGET_LIMIT,
      budgetEnabled: true,
      budgetExceeded: false,
      warningThreshold: 0.8,
      warningShown: false,
      sessionStartTime: Date.now(),
      lastResetTime: Date.now(),
      
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
          const newSessionTokens: SessionTokens = {
            input: state.sessionTokens.input + (usage.prompt_tokens || 0),
            output: state.sessionTokens.output + (usage.completion_tokens || 0),
            total: state.sessionTokens.total + (usage.total_tokens || 0),
          };
          const budgetExceeded = state.budgetEnabled && newSessionCost >= state.budgetLimit;
          const warningShown = newSessionCost >= (state.budgetLimit * state.warningThreshold);
          return { sessionCost: newSessionCost, sessionTokens: newSessionTokens, costByFeature: newCostByFeature, budgetExceeded, warningShown };
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
      partialize: (state) => ({
        budgetLimit: state.budgetLimit,
        budgetEnabled: state.budgetEnabled,
        warningThreshold: state.warningThreshold,
      }),
    }
  )
);

interface ConfigureOptions {
  limit?: number;
  enabled?: boolean;
  warningThreshold?: number;
}

class AIBudgetGuard {
  private store: typeof useBudgetStore;
  
  constructor() {
    this.store = useBudgetStore;
  }
  
  trackUsage(feature: string, usage: TokenUsage, model = 'gpt-4o'): void {
    this.store.getState().trackUsage(feature, usage, model);
  }
  
  canMakeRequest(): boolean {
    return this.store.getState().canMakeRequest();
  }
  
  getStats(): BudgetStats {
    return this.store.getState().getStats();
  }
  
  shouldShowWarning(): boolean {
    return this.store.getState().shouldShowWarning();
  }
  
  resetSession(): void {
    this.store.getState().resetSession();
  }
  
  configure(options: ConfigureOptions = {}): void {
    const { limit, enabled, warningThreshold } = options;
    if (limit !== undefined) this.store.getState().setBudgetLimit(limit);
    if (enabled !== undefined) this.store.getState().setBudgetEnabled(enabled);
    if (warningThreshold !== undefined) this.store.getState().setWarningThreshold(warningThreshold);
  }
  
  formatCost(cost: number): string {
    return `$${cost.toFixed(4)}`;
  }
  
  formatTokens(tokens: number): string {
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  }
}

export default new AIBudgetGuard();
