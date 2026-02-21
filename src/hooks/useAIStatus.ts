import { create } from 'zustand';
import { AIStatus } from '../components/modern/AIStatusIndicator';

interface AIStatusState {
  status: AIStatus;
  setStatus: (status: AIStatus) => void;
  setThinking: () => void;
  setReady: () => void;
  setOffline: () => void;
  setError: () => void;
}

export const useAIStatusStore = create<AIStatusState>((set) => ({
  status: 'ready',
  setStatus: (status) => set({ status }),
  setThinking: () => set({ status: 'thinking' }),
  setReady: () => set({ status: 'ready' }),
  setOffline: () => set({ status: 'offline' }),
  setError: () => set({ status: 'error' }),
}));

export const useAIStatus = () => {
  const { status, setStatus, setThinking, setReady, setOffline, setError } = useAIStatusStore();
  
  return {
    status,
    setStatus,
    setThinking,
    setReady,
    setOffline,
    setError,
  };
};

export default useAIStatus;
