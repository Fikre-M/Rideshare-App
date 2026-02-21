import { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useTheme, useMediaQuery, IconButton, Tooltip } from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import aiService from '../../services/aiService';
import { useChatStore } from '../../stores/chatStore';
import MarkdownMessage from './MarkdownMessage';
import ConversationHistory from './ConversationHistory';

const ChatBot = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { 
    getActiveConversation, 
    addMessage, 
    createConversation,
    activeConversationId 
  } = useChatStore();
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const conversation = getActiveConversation();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  // Focus input when opened
  useEffect(() => {
    if (open && !isMobile) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, isMobile]);

  // Create conversation if none exists
  useEffect(() => {
    if (open && !conversation) {
      createConversation();
    }
  }, [open, conversation, createConversation]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !conversation) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    addMessage(conversation.id, userMessage);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiService.sendChatMessage(inputValue, {
        conversationId: conversation.id,
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        suggestions: response.suggestions,
        confidence: response.confidence,
      };

      addMessage(conversation.id, botMessage);
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorText = "Sorry, I'm having trouble connecting to the AI service.";
      
      // Check if it's a quota error
      if (error.message?.includes('quota') || error.message?.includes('429')) {
        errorText = "⚠️ API Quota Exceeded\n\nThe free tier of Google Gemini allows 20 requests per day, and we've reached that limit.\n\nSolutions:\n• Wait 24 hours for the quota to reset\n• Create a new API key at https://makersuite.google.com/app/apikey\n• Upgrade to a paid tier for higher limits\n\nFor now, I'll provide basic assistance with mock responses.";
      } else {
        errorText = "Sorry, I'm having trouble connecting to the AI service. Please make sure:\n\n1. Your VITE_GOOGLE_AI_API_KEY is set in the .env file\n2. You've restarted the dev server after adding the API key\n3. Your API key is valid\n\nCheck the browser console for more details.";
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        isUser: false,
        timestamp: new Date(),
        isError: true,
      };
      addMessage(conversation.id, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  if (!open) return null;

  const messages = conversation?.messages || [];

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3 
      }}
      style={{
        position: 'fixed',
        bottom: isMobile ? 0 : '100px',
        right: isMobile ? 0 : '24px',
        left: isMobile ? 0 : 'auto',
        width: isMobile ? '100%' : (showHistory ? '680px' : '400px'),
        maxWidth: isMobile ? '100%' : 'calc(100vw - 48px)',
        height: isMobile ? '100vh' : '600px',
        maxHeight: isMobile ? '100vh' : 'calc(100vh - 140px)',
        zIndex: 9999,
        transformOrigin: isMobile ? 'center' : 'bottom right',
        backgroundColor: 'white',
        borderRadius: isMobile ? 0 : '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: isMobile ? 'none' : '1px solid #e5e7eb',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        transition: 'width 0.3s ease',
      }}
    >
      {/* Conversation History Sidebar */}
      {showHistory && !isMobile && (
        <ConversationHistory onNewChat={() => setShowHistory(false)} />
      )}

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div 
          style={{
            background: 'linear-gradient(to right, #2563eb, #7c3aed, #4f46e5)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)'
              }}
            >
              <svg 
                style={{ width: '24px', height: '24px', color: '#fbbf24' }} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09z" 
                />
              </svg>
            </div>
            <div>
              <h3 style={{ color: 'white', fontWeight: '600', fontSize: '18px', margin: 0 }}>
                AI Assistant
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div 
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }}
                ></div>
                <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', margin: 0 }}>
                  Online
                </p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isMobile && (
              <Tooltip title={showHistory ? "Hide History" : "Show History"}>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  style={{
                    color: 'white',
                    backgroundColor: showHistory ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <HistoryIcon fontSize="small" />
                </button>
              </Tooltip>
            )}
            <button
              onClick={onClose}
              style={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            background: 'linear-gradient(to bottom, rgba(249, 250, 251, 0.5), white)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {messages.map((message) => (
            <m.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                display: 'flex',
                justifyContent: message.isUser ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{ maxWidth: '85%' }}>
                {!message.isUser && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div 
                      style={{
                        width: '24px',
                        height: '24px',
                        background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg style={{ width: '12px', height: '12px', color: '#fbbf24' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      AI Assistant
                    </span>
                  </div>
                )}
                
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '16px',
                    position: 'relative',
                    ...(message.isUser 
                      ? {
                          background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                          color: 'white',
                          borderBottomRightRadius: '4px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }
                      : {
                          backgroundColor: 'white',
                          color: '#1f2937',
                          borderBottomLeftRadius: '4px',
                          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                          border: '1px solid #f3f4f6'
                        })
                  }}
                >
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <MarkdownMessage content={message.text} isUser={message.isUser} />
                  </div>
                  
                  {/* Message Actions */}
                  {!message.isUser && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                      <Tooltip title="Copy">
                        <button
                          onClick={() => handleCopyMessage(message.text)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.6,
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = '1'}
                          onMouseLeave={(e) => e.target.style.opacity = '0.6'}
                        >
                          <CopyIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                        </button>
                      </Tooltip>
                    </div>
                  )}
                  
                  {message.confidence && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                      <div 
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#10b981',
                          borderRadius: '50%'
                        }}
                      ></div>
                      <p style={{ fontSize: '12px', opacity: 0.7, margin: 0 }}>
                        {(message.confidence * 100).toFixed(0)}% confident
                      </p>
                    </div>
                  )}
                </div>
                
                {message.suggestions && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                    {message.suggestions.map((suggestion, index) => (
                      <m.button
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          background: 'linear-gradient(to right, #dbeafe, #e0e7ff)',
                          color: '#1d4ed8',
                          borderRadius: '20px',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #bfdbfe, #c7d2fe)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'linear-gradient(to right, #dbeafe, #e0e7ff)';
                        }}
                      >
                        {suggestion}
                      </m.button>
                    ))}
                  </div>
                )}
              </div>
            </m.div>
          ))}
          
          {isLoading && (
            <m.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', justifyContent: 'flex-start' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div 
                    style={{
                      width: '24px',
                      height: '24px',
                      background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <svg style={{ width: '12px', height: '12px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                    AI Assistant
                  </span>
                </div>
                <div 
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    borderBottomLeftRadius: '4px',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    border: '1px solid #f3f4f6',
                    padding: '12px 16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div 
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#3b82f6',
                          borderRadius: '50%',
                          animation: 'bounce 1s infinite'
                        }}
                      ></div>
                      <div 
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#8b5cf6',
                          borderRadius: '50%',
                          animation: 'bounce 1s infinite 0.1s'
                        }}
                      ></div>
                      <div 
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#4f46e5',
                          borderRadius: '50%',
                          animation: 'bounce 1s infinite 0.2s'
                        }}
                      ></div>
                    </div>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Thinking...</span>
                  </div>
                </div>
              </div>
            </m.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div 
          style={{
            padding: '16px',
            backgroundColor: 'white',
            borderTop: '1px solid #f3f4f6'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isLoading}
                rows={1}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  outline: 'none',
                  color: '#1f2937',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  minHeight: '44px',
                  maxHeight: '120px',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <m.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              style={{
                padding: '12px',
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
                opacity: inputValue.trim() && !isLoading ? 1 : 0.5,
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (inputValue.trim() && !isLoading) {
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </m.button>
          </div>
        </div>
      </div>
    </m.div>
  );
};

// Chat Trigger Button (unchanged)
const ChatTrigger = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPulsing(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <m.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "64px",
        height: "64px",
        zIndex: 9998,
        transformOrigin: "center",
      }}
      className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center"
    >
      <m.div
        animate={isHovered ? { rotate: [0, -10, 10, -10, 0] } : {}}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative z-10"
      >
        <svg
          className="w-7 h-7 text-yellow-400 transition-all duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{
            filter: isHovered
              ? "drop-shadow(0 0 8px rgba(255,215,0,0.9))"
              : "drop-shadow(0 1px 2px rgba(255,215,0,0.4))",
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
          />
        </svg>
      </m.div>

      {isPulsing && (
        <m.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-500"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      </div>
    </m.button>
  );
};

export { ChatTrigger };
export default ChatBot;
