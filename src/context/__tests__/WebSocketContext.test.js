import { renderHook, act } from '@testing-library/react';
import { WebSocketProvider, useWebSocket } from '../WebSocketContext';

// Mock WebSocket
class WebSocketMock {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
    this.sentMessages = [];
    
    // Simulate connection
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 0);
  }

  send(data) {
    this.sentMessages.push(JSON.parse(data));
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) this.onclose({ code: 1000 });
  }

  // Helper method for testing
  triggerMessage(message) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(message) });
    }
  }
}

// Mock the global WebSocket
const mockWebSocket = jest.fn().mockImplementation((url) => new WebSocketMock(url));
global.WebSocket = mockWebSocket;

describe('WebSocketContext', () => {
  const renderWebSocketHook = () => {
    return renderHook(() => useWebSocket(), {
      wrapper: ({ children }) => (
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      ),
    });
  };
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset the WebSocket mock
    mockWebSocket.mockClear();
    global.WebSocket = mockWebSocket;
  });
  
  it('should establish WebSocket connection', () => {
    const { result } = renderWebSocketHook();
    expect(result.current.isConnected).toBe(true);
  });
  
  it('should send messages', () => {
    const { result } = renderWebSocketHook();
    
    const testMessage = { type: 'test', data: 'test' };
    act(() => {
      result.current.sendMessage(testMessage);
    });
    
    // Get the WebSocket instance
    const wsInstance = mockWebSocket.mock.results[0].value;
    expect(wsInstance.sentMessages).toContainEqual(testMessage);
  });
  
  it('should handle incoming messages', () => {
    const { result } = renderWebSocketHook();
    
    const testMessage = { type: 'test', data: 'test' };
    const wsInstance = mockWebSocket.mock.results[0].value;
    
    act(() => {
      wsInstance.triggerMessage(testMessage);
    });
    
    expect(result.current.lastMessage).toEqual(testMessage);
  });
  
  it('should handle connection close', () => {
    const { result } = renderWebSocketHook();
    const wsInstance = mockWebSocket.mock.results[0].value;
    
    act(() => {
      wsInstance.close();
    });
    
    expect(result.current.isConnected).toBe(false);
  });
  
  it('should clean up on unmount', () => {
    const { result, unmount } = renderWebSocketHook();
    const wsInstance = mockWebSocket.mock.results[0].value;
    
    const closeSpy = jest.spyOn(wsInstance, 'close');
    
    unmount();
    
    expect(closeSpy).toHaveBeenCalled();
  });
});
