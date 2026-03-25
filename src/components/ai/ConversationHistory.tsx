// @ts-nocheck
import { useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useChatStore } from '../../stores/chatStore';

/**
 * ConversationHistory - Sidebar showing past conversations
 * @param {Object} props
 * @param {Function} props.onNewChat - Callback when new chat is created
 */
const ConversationHistory = ({ onNewChat }) => {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    deleteConversation,
    createConversation,
  } = useChatStore();

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedConvId, setSelectedConvId] = useState(null);

  const handleMenuOpen = (event, convId) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedConvId(convId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedConvId(null);
  };

  const handleDelete = () => {
    if (selectedConvId) {
      deleteConversation(selectedConvId);
    }
    handleMenuClose();
  };

  const handleNewChat = () => {
    const newId = createConversation();
    onNewChat?.();
  };

  // Sort conversations by most recent
  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  return (
    <Box
      sx={{
        width: 280,
        height: '100%',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          Conversations
        </Typography>
        <Tooltip title="New Chat">
          <IconButton
            size="small"
            onClick={handleNewChat}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Conversation List */}
      <List sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
        {sortedConversations.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No conversations yet
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Start a new chat to begin
            </Typography>
          </Box>
        ) : (
          sortedConversations.map((conv) => (
            <ListItemButton
              key={conv.id}
              selected={conv.id === activeConversationId}
              onClick={() => setActiveConversation(conv.id)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '& .MuiListItemText-secondary': {
                    color: 'rgba(255,255,255,0.7)',
                  },
                },
              }}
            >
              <ListItemText
                primary={conv.title}
                secondary={formatDistanceToNow(new Date(conv.updatedAt), {
                  addSuffix: true,
                })}
                primaryTypographyProps={{
                  noWrap: true,
                  fontSize: '0.875rem',
                  fontWeight: conv.id === activeConversationId ? 600 : 400,
                }}
                secondaryTypographyProps={{
                  noWrap: true,
                  fontSize: '0.75rem',
                }}
              />
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, conv.id)}
                sx={{
                  ml: 1,
                  opacity: 0.7,
                  '&:hover': {
                    opacity: 1,
                  },
                }}
              >
                <MoreIcon fontSize="small" />
              </IconButton>
            </ListItemButton>
          ))
        )}
      </List>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ConversationHistory;
