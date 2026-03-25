import { createContext, useContext, useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useNotification } from "../hooks";
import { useAuth } from './AuthContext';

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

type MessageHandler = (data: unknown) => void;

export interface WebSocketContextType {
  send: (type: string, data: unknown) => Promise<void>;
  subscribe: (messageType: string, handler: MessageHandler) => () => void;
  isConnected: () => boolean;
  status: ConnectionStatus;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const ws = useRef<WebSocket | null>(null);
  const { showError, showWarning } = useNotification();
  const { isAuthenticated, token } = useAuth();
  
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageQueue = useRef<Array<{ type: string; data: unknown; resolve?: () => void; reject?: (e: unknown) => void }>>([]);
  const messageHandlers = useRef(new Map<string, Set<MessageHandler>>());
  const pingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPongTime = useRef(Date.now());

  const getEnvVariable = (key: string, defaultValue: string): string => {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
    return defaultValue;
  };

  const getReconnectDelay = useCallback((): number => {
    return Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current - 1),
      MAX_RECONNECT_DELAY
    );
  }, []);

  const processQueue = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      while (messageQueue.current.length > 0) {
        const item = messageQueue.current.shift();
        if (!item) continue;
        const { type, data, resolve, reject } = item;
        try {
          ws.current.send(JSON.stringify({ type, data }));
          if (resolve) resolve();
        } catch (error) {
          if (reject) reject(error);
        }
      }
    }
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data as string) as { type: string; data: unknown };
      lastPongTime.current = Date.now();

      if (message.type === 'pong') return;

      const handlers = messageHandlers.current.get(message.type) || new Set();
      handlers.forEach(handler => handler(message.data));

      const wildcardHandlers = messageHandlers.current.get('*') || new Set();
      wildcardHandlers.forEach(handler => handler(message));
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }, []);

  const sendPing = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'ping' }));
      if (Date.now() - lastPongTime.current > 10000) {
        console.warn('No pong received, reconnecting...');
        ws.current.close();
      }
    }
  }, []);

  const isConnected = useCallback((): boolean => {
    return ws.current?.readyState === WebSocket.OPEN;
  }, []);

  const connect = useCallback(() => {
    if (isConnected() || !token) return;

    setStatus('connecting');
    
    const wsUrlString = getEnvVariable('VITE_WS_URL', 'ws://localhost:8000/ws');
    const wsUrl = new URL(wsUrlString);
    wsUrl.searchParams.set('token', token);

    ws.current = new WebSocket(wsUrl.toString());
    ws.current.binaryType = 'arraybuffer';

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setStatus('connected');
      reconnectAttempts.current = 0;
      pingInterval.current = setInterval(sendPing, 30000);
      processQueue();
    };

    ws.current.onmessage = handleMessage;

    ws.current.onclose = (event: CloseEvent) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setStatus('disconnected');
      if (pingInterval.current) {
        clearInterval(pingInterval.current);
        pingInterval.current = null;
      }

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

    ws.current.onerror = () => {
      console.error('WebSocket error');
      setStatus('error');
      if (ws.current) ws.current.close();
    };
  }, [token, isAuthenticated, getReconnectDelay, handleMessage, processQueue, sendPing, showError, showWarning, isConnected]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      if (ws.current) ws.current.close();
      setStatus('disconnected');
    }

    return () => {
      if (ws.current) ws.current.close();
      if (pingInterval.current) clearInterval(pingInterval.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [isAuthenticated, connect]);

  const subscribe = useCallback((messageType: string, handler: MessageHandler): () => void => {
    if (!messageHandlers.current.has(messageType)) {
      messageHandlers.current.set(messageType, new Set());
    }
    messageHandlers.current.get(messageType)!.add(handler);

    return () => {
      if (messageHandlers.current.has(messageType)) {
        const handlers = messageHandlers.current.get(messageType)!;
        handlers.delete(handler);
        if (handlers.size === 0) messageHandlers.current.delete(messageType);
      }
    };
  }, []);

  const send = useCallback((type: string, data: unknown): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        try {
          ws.current.send(JSON.stringify({ type, data }));
          resolve();
        } catch (error) {
          reject(error);
        }
      } else {
        messageQueue.current.push({ type, data, resolve, reject });
        if (status === 'disconnected' && isAuthenticated) connect();
      }
    });
  }, [connect, isAuthenticated, status]);

  const value = useMemo<WebSocketContextType>(() => ({
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

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
