import { createContext, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNotification } from '@/hooks';
import { useAuth } from './AuthContext';

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);
  const { showError, showWarning } = useNotification();
  const { isAuthenticated, token } = useAuth();
  
  // State for connection status and reconnection
  const [status, setStatus] = useState('disconnected'); // 'connected' | 'connecting' | 'disconnected' | 'error'
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const messageQueue = useRef([]);
  const messageHandlers = useRef(new Map());
  const pingInterval = useRef(null);
  const lastPongTime = useRef(Date.now());

  // Calculate next reconnect delay with exponential backoff
  const getReconnectDelay = useCallback(() => {
    return Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current - 1),
      MAX_RECONNECT_DELAY
    );
  }, []);

  // Process queued messages
  const processQueue = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      while (messageQueue.current.length > 0) {
        const { type, data, resolve, reject } = messageQueue.current.shift();
        try {
          ws.current.send(JSON.stringify({ type, data }));
          resolve?.();
        } catch (error) {
          reject?.(error);
        }
      }
    }
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((event) => {
    try {
      const message = JSON.parse(event.data);
      lastPongTime.current = Date.now();

      // Handle pong messages
      if (message.type === 'pong') {
        return;
      }

      // Notify all handlers for this message type
      const handlers = messageHandlers.current.get(message.type) || [];
      handlers.forEach(handler => handler(message.data));

      // Notify wildcard handlers
      const wildcardHandlers = messageHandlers.current.get('*') || [];
      wildcardHandlers.forEach(handler => handler(message));
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }, []);

  // Send ping to keep connection alive
  const sendPing = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'ping' }));
      
      // Check if we haven't received a pong in a while
      if (Date.now() - lastPongTime.current > 10000) { // 10 seconds without pong
        console.warn('No pong received, reconnecting...');
        ws.current.close();
      }
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (isConnected() || !token) return;

    setStatus('connecting');
    const wsUrl = new URL(import.meta.env.VITE_WS_URL || 'wss://api.example.com/ws');
    wsUrl.searchParams.set('token', token);

    ws.current = new WebSocket(wsUrl.toString());
    ws.current.binaryType = 'arraybuffer';

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setStatus('connected');
      reconnectAttempts.current = 0;
      
      // Start ping interval
      pingInterval.current = setInterval(sendPing, 30000); // 30 seconds
      
      // Process any queued messages
      processQueue();
    };

    ws.current.onmessage = handleMessage;

    ws.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setStatus('disconnected');
      
      // Clear ping interval
      if (pingInterval.current) {
        clearInterval(pingInterval.current);
        pingInterval.current = null;
      }

      // Attempt to reconnect if we didn't close intentionally
      if (event.code !== 1000 && isAuthenticated) {
        const delay = getReconnectDelay();
        console.log(`Attempting to reconnect in ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connect();
        }, delay);

        if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
          showError('Connection lost. Please check your network and refresh the page.');
        } else if (reconnectAttempts.current === 1) {
          showWarning('Connection lost. Attempting to reconnect...');
        }
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('error');
      ws.current?.close();
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [token, isAuthenticated, getReconnectDelay, handleMessage, processQueue, sendPing, showError, showWarning]);

  // Reconnect when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      if (ws.current) {
        ws.current.close();
      }
      setStatus('disconnected');
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (pingInterval.current) {
        clearInterval(pingInterval.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, connect]);

  // Subscribe to message types
  const subscribe = useCallback((messageType, handler) => {
    if (!messageHandlers.current.has(messageType)) {
      messageHandlers.current.set(messageType, new Set());
    }
    messageHandlers.current.get(messageType).add(handler);

    // Return unsubscribe function
    return () => {
      if (messageHandlers.current.has(messageType)) {
        const handlers = messageHandlers.current.get(messageType);
        handlers.delete(handler);
        if (handlers.size === 0) {
          messageHandlers.current.delete(messageType);
        }
      }
    };
  }, []);

  // Send message to WebSocket
  const send = useCallback((type, data) => {
    return new Promise((resolve, reject) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        try {
          ws.current.send(JSON.stringify({ type, data }));
          resolve();
        } catch (error) {
          reject(error);
        }
      } else {
        // Queue the message if not connected
        messageQueue.current.push({ type, data, resolve, reject });
        
        // Try to reconnect if not already connecting
        if (status === 'disconnected' && isAuthenticated) {
          connect();
        }
      }
    });
  }, [connect, isAuthenticated, status]);

  // Check if WebSocket is connected
  const isConnected = useCallback(() => {
    return ws.current?.readyState === WebSocket.OPEN;
  }, []);

  // Context value
  const value = useMemo(() => ({
    send,
    subscribe,
    isConnected,
    status,
  }), [send, subscribe, isConnected, status]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
