import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Fab,
  Slide,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import aiService from '../../services/aiService';

const ChatContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 100,
  right: 24,
  width: 350,
  height: 500,
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1300,
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: theme.shadows[8],
  [theme.breakpoints.down('sm')]: {
    width: 'calc(100vw - 32px)',
    height: 'calc(100vh - 120px)',
    right: 16,
    bottom: 80,
  },
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isUser',
})(({ theme, isUser }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(1),
  flexDirection: isUser ? 'row-reverse' : 'row',
}));

const MessageContent = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isUser',
})(({ theme, isUser }) => ({
  padding: theme.spacing(1, 1.5),
  maxWidth: '80%',
  marginLeft: isUser ? 0 : theme.spacing(1),
  marginRight: isUser ? theme.spacing(1) : 0,
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.background.paper,
  color: isUser ? 'white' : theme.palette.text.primary,
  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const ChatBot = ({ open, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI assistant. I can help you book rides, track drivers, get fare estimates, and answer questions about your trips. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
      suggestions: ['Book a ride', 'Track my driver', 'Fare estimate', 'Cancel trip'],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiService.sendChatMessage(inputValue, {
        userId: 'current_user',
        sessionId: 'chat_session_' + Date.now(),
      });

      const botMessage = {
        id: Date.now() + 1,
        text: response.response,
        isUser: false,
        timestamp: new Date(),
        suggestions: response.suggestions,
        confidence: response.confidence,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
          <ChatContainer>
            <ChatHeader>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 1 }}>
                  <BotIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    AI Assistant
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Online • Ready to help
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={onClose} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </ChatHeader>

            <MessagesContainer>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <MessageBubble isUser={message.isUser}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: message.isUser ? 'primary.main' : 'secondary.main',
                      }}
                    >
                      {message.isUser ? <UserIcon /> : <BotIcon />}
                    </Avatar>
                    <MessageContent isUser={message.isUser}>
                      <Typography variant="body2">{message.text}</Typography>
                      {message.confidence && (
                        <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, display: 'block' }}>
                          Confidence: {(message.confidence * 100).toFixed(0)}%
                        </Typography>
                      )}
                    </MessageContent>
                  </MessageBubble>
                  
                  {message.suggestions && (
                    <Box sx={{ ml: 5, mb: 1 }}>
                      {message.suggestions.map((suggestion, index) => (
                        <Chip
                          key={index}
                          label={suggestion}
                          size="small"
                          onClick={() => handleSuggestionClick(suggestion)}
                          sx={{ mr: 0.5, mb: 0.5, cursor: 'pointer' }}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}
                </motion.div>
              ))}
              
              {isLoading && (
                <MessageBubble isUser={false}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    <BotIcon />
                  </Avatar>
                  <MessageContent isUser={false}>
                    <Box display="flex" alignItems="center">
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      <Typography variant="body2">Thinking...</Typography>
                    </Box>
                  </MessageContent>
                </MessageBubble>
              )}
              
              <div ref={messagesEndRef} />
            </MessagesContainer>

            <InputContainer>
              <Box display="flex" alignItems="flex-end" gap={1}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    },
                  }}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  color="primary"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&:disabled': { bgcolor: 'action.disabled' },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </InputContainer>
          </ChatContainer>
        </Slide>
      )}
    </AnimatePresence>
  );
};

// Chat Trigger Button
export const ChatTrigger = ({ onClick }) => {
  return (
    <Fab
      color="primary"
      onClick={onClick}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1200,
      }}
    >
      <BotIcon />
    </Fab>
  );
};

export default ChatBot;