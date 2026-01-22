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
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
  Minimize as MinimizeIcon,
  Fullscreen as ExpandIcon,
  VolumeUp as SpeakIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import aiService from '../../services/aiService';

const ChatContainer = styled(Paper)(({ theme, expanded }) => ({
  position: 'fixed',
  bottom: expanded ? 20 : 100,
  right: 24,
  width: expanded ? 420 : 350,
  height: expanded ? 600 : 500,
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1300,
  borderRadius: 20,
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
  border: `1px solid ${theme.palette.divider}`,
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
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
  backdropFilter: 'blur(20px)',
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.paper,
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.primary.light,
    borderRadius: '3px',
  },
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isUser',
})(({ theme, isUser }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(2),
  flexDirection: isUser ? 'row-reverse' : 'row',
}));

const MessageContent = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isUser',
})(({ theme, isUser }) => ({
  padding: theme.spacing(1.5, 2),
  maxWidth: '80%',
  marginLeft: isUser ? 0 : theme.spacing(1),
  marginRight: isUser ? theme.spacing(1) : 0,
  background: isUser 
    ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
    : theme.palette.background.paper,
  color: isUser ? 'white' : theme.palette.text.primary,
  borderRadius: isUser ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
  boxShadow: theme.shadows[2],
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: 0,
    height: 0,
    border: '8px solid transparent',
    borderTopColor: isUser ? theme.palette.primary.main : theme.palette.background.paper,
    bottom: -8,
    [isUser ? 'right' : 'left']: 12,
  },
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  backdropFilter: 'blur(20px)',
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
    boxShadow: '0 12px 32px rgba(25, 118, 210, 0.4)',
    transform: 'scale(1.1)',
  },
  transition: 'all 0.3s ease',
}));

const ChatBot = ({ open, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hi! I'm your AI assistant. I can help you with booking rides, tracking drivers, fare estimates, and answering questions about your trips. What can I help you with today?",
      isUser: false,
      timestamp: new Date(),
      suggestions: ['Book a ride', 'Track my driver', 'Fare estimate', 'Cancel trip'],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open) {
      setUnreadCount(0);
    }
  }, [open]);

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
      
      if (!open) {
        setUnreadCount(prev => prev + 1);
      }
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

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <AnimatePresence>
      {open && (
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
          <ChatContainer expanded={isExpanded}>
            <ChatHeader>
              <Box display="flex" alignItems="center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 40, height: 40 }}>
                    <BotIcon />
                  </Avatar>
                </motion.div>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    AI Assistant
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    🟢 Online • Ready to help
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center">
                <Tooltip title={isExpanded ? "Minimize" : "Expand"}>
                  <IconButton onClick={handleExpand} sx={{ color: 'white', mr: 1 }}>
                    {isExpanded ? <MinimizeIcon /> : <ExpandIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Close">
                  <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </ChatHeader>

            {!isMinimized && (
              <>
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
                        <Box sx={{ ml: message.isUser ? 0 : 5, mr: message.isUser ? 5 : 0, mb: 1 }}>
                          {message.suggestions.map((suggestion, index) => (
                            <Chip
                              key={index}
                              label={suggestion}
                              size="small"
                              onClick={() => handleSuggestionClick(suggestion)}
                              sx={{ 
                                mr: 0.5, 
                                mb: 0.5, 
                                cursor: 'pointer',
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                  color: 'white',
                                }
                              }}
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
                          <Typography variant="body2">AI is thinking...</Typography>
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
                          backgroundColor: 'background.default',
                        },
                      }}
                    />
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
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
              </>
            )}
          </ChatContainer>
        </Slide>
      )}
    </AnimatePresence>
  );
};

// Enhanced Chat Trigger Button
export const ChatTrigger = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [unreadCount] = useState(0);

  return (
    <Tooltip title="Chat with AI Assistant" placement="left">
      <Badge badgeContent={unreadCount} color="error">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <StyledFab
            onClick={onClick}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1200,
            }}
          >
            <motion.div
              animate={isHovered ? { rotate: [0, -10, 10, -10, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <BotIcon />
            </motion.div>
          </StyledFab>
        </motion.div>
      </Badge>
    </Tooltip>
  );
};

export default ChatBot;