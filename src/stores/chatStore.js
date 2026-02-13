import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Chat Store - Manages conversation history and persistence
 * Uses Zustand with localStorage persistence
 */
export const useChatStore = create(
  persist(
    (set, get) => ({
      // State
      conversations: [],
      activeConversationId: null,
      
      /**
       * Create a new conversation
       * @returns {number} New conversation ID
       */
      createConversation: () => {
        const id = Date.now();
        const newConversation = {
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
      
      /**
       * Add a message to a conversation
       * @param {number} conversationId - Conversation ID
       * @param {Object} message - Message object
       */
      addMessage: (conversationId, message) => {
        set(state => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, message],
                  updatedAt: new Date().toISOString(),
                  // Auto-generate title from first user message
                  title: conv.messages.length === 1 && message.isUser
                    ? message.text.slice(0, 30) + (message.text.length > 30 ? '...' : '')
                    : conv.title
                }
              : conv
          )
        }));
      },
      
      /**
       * Get active conversation
       * @returns {Object|undefined} Active conversation
       */
      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find(c => c.id === activeConversationId);
      },
      
      /**
       * Set active conversation
       * @param {number} conversationId - Conversation ID
       */
      setActiveConversation: (conversationId) => {
        set({ activeConversationId: conversationId });
      },
      
      /**
       * Delete a conversation
       * @param {number} conversationId - Conversation ID
       */
      deleteConversation: (conversationId) => {
        set(state => {
          const newConversations = state.conversations.filter(c => c.id !== conversationId);
          const newActiveId = state.activeConversationId === conversationId
            ? (newConversations[0]?.id || null)
            : state.activeConversationId;
          
          return {
            conversations: newConversations,
            activeConversationId: newActiveId
          };
        });
      },
      
      /**
       * Clear all conversations
       */
      clearAllConversations: () => {
        set({
          conversations: [],
          activeConversationId: null
        });
      },
      
      /**
       * Update conversation title
       * @param {number} conversationId - Conversation ID
       * @param {string} title - New title
       */
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
      name: 'chat-storage', // localStorage key
      version: 1,
    }
  )
);
