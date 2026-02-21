/**
 * AI Model Store
 * Manages multi-model support (GPT-4o, GPT-4o-mini, Claude 3.5 Sonnet)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIModel = 'gpt-4o' | 'gpt-4o-mini' | 'claude-3.5-sonnet';

export interface ModelConfig {
  id: AIModel;
  name: string;
  provider: 'openai' | 'anthropic';
  costPer1kTokens: {
    input: number;
    output: number;
  };
  maxTokens: number;
  description: string;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'high' | 'medium' | 'standard';
}

export const MODEL_CONFIGS: Record<AIModel, ModelConfig> = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    costPer1kTokens: {
      input: 0.005,
      output: 0.015,
    },
    maxTokens: 128000,
    description: 'Most capable model with vision and advanced reasoning',
    speed: 'medium',
    quality: 'high',
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    costPer1kTokens: {
      input: 0.00015,
      output: 0.0006,
    },
    maxTokens: 128000,
    description: 'Fast and affordable, great for most tasks',
    speed: 'fast',
    quality: 'medium',
  },
  'claude-3.5-sonnet': {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    costPer1kTokens: {
      input: 0.003,
      output: 0.015,
    },
    maxTokens: 200000,
    description: 'Excellent reasoning and coding capabilities',
    speed: 'medium',
    quality: 'high',
  },
};

interface ModelState {
  selectedModel: AIModel;
  apiKeys: {
    openai?: string;
    anthropic?: string;
  };
  usageStats: {
    [key in AIModel]?: {
      requests: number;
      totalCost: number;
      totalTokens: number;
    };
  };
  setModel: (model: AIModel) => void;
  setApiKey: (provider: 'openai' | 'anthropic', key: string) => void;
  estimateCost: (model: AIModel, inputTokens: number, outputTokens: number) => number;
  trackUsage: (model: AIModel, cost: number, tokens: number) => void;
  getModelConfig: (model: AIModel) => ModelConfig;
  isModelAvailable: (model: AIModel) => boolean;
}

export const useModelStore = create<ModelState>()(
  persist(
    (set, get) => ({
      selectedModel: 'gpt-4o-mini',
      apiKeys: {},
      usageStats: {},

      setModel: (model: AIModel) => {
        if (get().isModelAvailable(model)) {
          set({ selectedModel: model });
        } else {
          console.warn(`Model ${model} is not available. API key missing.`);
        }
      },

      setApiKey: (provider: 'openai' | 'anthropic', key: string) => {
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [provider]: key,
          },
        }));
      },

      estimateCost: (model: AIModel, inputTokens: number, outputTokens: number): number => {
        const config = MODEL_CONFIGS[model];
        const inputCost = (inputTokens / 1000) * config.costPer1kTokens.input;
        const outputCost = (outputTokens / 1000) * config.costPer1kTokens.output;
        return inputCost + outputCost;
      },

      trackUsage: (model: AIModel, cost: number, tokens: number) => {
        set((state) => {
          const currentStats = state.usageStats[model] || {
            requests: 0,
            totalCost: 0,
            totalTokens: 0,
          };

          return {
            usageStats: {
              ...state.usageStats,
              [model]: {
                requests: currentStats.requests + 1,
                totalCost: currentStats.totalCost + cost,
                totalTokens: currentStats.totalTokens + tokens,
              },
            },
          };
        });
      },

      getModelConfig: (model: AIModel): ModelConfig => {
        return MODEL_CONFIGS[model];
      },

      isModelAvailable: (model: AIModel): boolean => {
        const config = MODEL_CONFIGS[model];
        const { apiKeys } = get();
        return !!apiKeys[config.provider];
      },
    }),
    {
      name: 'model-storage',
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        apiKeys: state.apiKeys,
        usageStats: state.usageStats,
      }),
    }
  )
);
