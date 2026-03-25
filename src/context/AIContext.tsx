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

  const {
    data: suggestedRoutes,
    isLoading,
    error,
  } = useQuery<RouteSuggestion[], Error>({
    queryKey: ["ai-suggested-routes", aiPreferences],
    queryFn: async () => {
      const response = await fetch("/api/ai/suggest-routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiPreferences),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return response.json() as Promise<RouteSuggestion[]>;
    },
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  const contextValue: AIContextType = {
    aiPreferences,
    setAIPreferences: useCallback(
      (newPrefs: AIPreferences | ((prev: AIPreferences) => AIPreferences)) => {
        setAIPreferences(prev => ({
          ...(typeof newPrefs === "function" ? newPrefs(prev) : newPrefs),
        }));
      },
      []
    ),
    suggestedRoutes,
    isLoading,
    error: error ?? null,
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
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};
