import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ChatBot from '../ai/ChatBot';

// Mock dependencies
jest.mock('../../services/aiService', () => ({
  __esModule: true,
  default: { chat: jest.fn().mockResolvedValue({ message: 'Hello from AI', source: 'mock' }) },
}));

jest.mock('../../stores/chatStore', () => ({
  useChatStore: () => ({
    getActiveConversation: () => ({ id: 'conv-1', messages: [] }),
    addMessage: jest.fn(),
    createConversation: jest.fn().mockReturnValue('conv-1'),
    activeConversationId: 'conv-1',
  }),
}));

jest.mock('framer-motion', () => ({
  m: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

jest.mock('../ai/MarkdownMessage', () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => <div data-testid="markdown-message">{content}</div>,
}));

jest.mock('../ai/ConversationHistory', () => ({
  __esModule: true,
  default: () => <div data-testid="conversation-history" />,
}));

const theme = createTheme();

const renderChatBot = (props = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <ChatBot open={true} onClose={jest.fn()} {...props} />
    </ThemeProvider>
  );

describe('ChatBot', () => {
  it('renders when open', () => {
    renderChatBot();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <ThemeProvider theme={theme}>
        <ChatBot open={false} onClose={jest.fn()} />
      </ThemeProvider>
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    renderChatBot({ onClose });
    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('sends a message on form submit', async () => {
    renderChatBot();
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => expect(input).toHaveValue(''));
  });
});
