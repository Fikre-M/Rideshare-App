import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface Conversation {
  id: number;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: number | null;
  createConversation: () => number;
  addMessage: (conversationId: number, message: ChatMessage) => void;
  getActiveConversation: () => Conversation | undefined;
  setActiveConversation: (conversationId: number) => void;
  deleteConversation: (conversationId: number) => void;
  clearAllConversations: () => void;
  updateConversationTitle: (conversationId: number, title: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      
      createConversation: () => {
        const id = Date.now();
        const newConversation: Conversation = {
          id,
          title: 'New Chat',
          messages: [
            {
              id: Date.now(),
              text: "Hello! I'm your AI assistant powered by Google Gemini. I can help you with anything - from answering questions about weather, news, and general knowledge, to helping with coding, math, and much more. What would you like to know?",
              isUser: false,
              timestamp: new Date(),
              suggestions: ['What can you do?', 'Tell me about yourself', 'Help me with something', 'Book a ride'],
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          conversations: [...state.conversations, newConversation],
          activeConversationId: id
        }));
        
        return id;
      },
      
      addMessage: (conversationId, message) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, message],
                  updatedAt: new Date().toISOString(),
                  title: conv.messages.length === 1 && message.isUser
                    ? message.text.slice(0, 30) + (message.text.length > 30 ? '...' : '')
                    : conv.title
                }
              : conv
          )
        }));
      },
      
      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find(c => c.id === activeConversationId);
      },
      
      setActiveConversation: (conversationId) => {
        set({ activeConversationId: conversationId });
      },
      
      deleteConversation: (conversationId) => {
        set(state => {
          const newConversations = state.conversations.filter(c => c.id !== conversationId);
          const newActiveId = state.activeConversationId === conversationId
            ? (newConversations[0]?.id ?? null)
            : state.activeConversationId;
          return { conversations: newConversations, activeConversationId: newActiveId };
        });
      },
      
      clearAllConversations: () => {
        set({ conversations: [], activeConversationId: null });
      },
      
      updateConversationTitle: (conversationId, title) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? { ...conv, title, updatedAt: new Date().toISOString() }
              : conv
          )
        }));
      },
    }),
    {
      name: 'chat-storage',
      version: 1,
    }
  )
);
