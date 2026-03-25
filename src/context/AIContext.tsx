// @ts-nocheck
import { createContext, useContext, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { AIPreferences, AIContextType, RouteSuggestion } from "@/types/ai.types";

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIProviderProps {
  children: React.ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [aiPreferences, setAIPreferences] = useState<AIPreferences>({
    preferredRouteType: "fastest",
    communicationStyle: "concise",
    accessibilityNeeds: [],
  });

  // AI-powered route suggestions with loading and error states
  const { 
    data: suggestedRoutes, 
    isLoading, 
    error 
  } = useQuery<RouteSuggestion[], Error>(
    ["ai-suggested-routes", aiPreferences],
    async () => {
      try {
        const response = await fetch("/api/ai/suggest-routes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(aiPreferences),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
      } catch (err) {
        console.error("Failed to fetch suggested routes:", err);
        throw err;
      }
    },
    {
      retry: 2, // Retry failed requests 2 times
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    }
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = {
    aiPreferences,
    setAIPreferences: useCallback((newPrefs: AIPreferences | ((prev: AIPreferences) => AIPreferences)) => {
      setAIPreferences(prev => ({
        ...(typeof newPrefs === 'function' ? newPrefs(prev) : newPrefs)
      }));
    }, []),
    suggestedRoutes,
    isLoading,
    error: error || null,
  };

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
