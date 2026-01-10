import { renderHook, act } from '@testing-library/react-hooks';
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
    }, 100);
  }

  send(data) {
    this.sentMessages.push(JSON.parse(data));
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) this.onclose({ code: 1000 });
  }

  // Test helpers
  triggerMessage(message) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(message) });
    }
  }

  triggerError() {
    if (this.onerror) {
      this.onerror(new Error('WebSocket error'));
    }
  }
}

global.WebSocket = WebSocketMock;

describe('WebSocketContext', () => {
  let wrapper;
  
  beforeEach(() => {
    // Mock the AuthContext
    jest.mock('../../context/AuthContext', () => ({
      useAuth: () => ({
        isAuthenticated: true,
        token: 'test-token'
      })
    }));
    
    wrapper = ({ children }) => (
      <WebSocketProvider>
        {children}
      </WebSocketProvider>
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should establish WebSocket connection', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useWebSocket(), { wrapper });
    
    expect(result.current.isConnected()).toBe(false);
    
    await waitForNextUpdate({ timeout: 200 });
    
    expect(result.current.isConnected()).toBe(true);
  });

  it('should send and receive messages', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useWebSocket(), { wrapper });
    await waitForNextUpdate({ timeout: 200 });
    
    const messageHandler = jest.fn();
    
    // Subscribe to messages
    act(() => {
      result.current.subscribe('test.message', messageHandler);
    });
    
    // Send a message
    await act(async () => {
      await result.current.send('test.message', { foo: 'bar' });
    });
    
    // Trigger a message from the server
    act(() => {
      result.current.ws.triggerMessage({
        type: 'test.message',
        data: { foo: 'bar' }
      });
    });
    
    expect(messageHandler).toHaveBeenCalledWith({ foo: 'bar' });
  });

  it('should handle reconnection', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useWebSocket(), { wrapper });
    await waitForNextUpdate({ timeout: 200 });
    
    // Simulate connection loss
    act(() => {
      result.current.ws.close();
    });
    
    expect(result.current.isConnected()).toBe(false);
    
    // Should attempt to reconnect
    await waitForNextUpdate({ timeout: 2000 });
    expect(result.current.isConnected()).toBe(true);
  });

  it('should queue messages when disconnected', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useWebSocket(), { wrapper });
    
    // Send message before connection is established
    const sendPromise = act(async () => {
      await result.current.send('test.message', { queued: true });
    });
    
    // Wait for connection
    await waitForNextUpdate({ timeout: 200 });
    
    // The message should be sent after connection
    await expect(sendPromise).resolves.not.toThrow();
    expect(result.current.ws.sentMessages).toContainEqual({
      type: 'test.message',
      data: { queued: true }
    });
  });
});
