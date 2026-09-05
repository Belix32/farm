import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onOrderUpdate: (callback: (order: any) => void) => () => void;
  onVetAlert: (callback: (check: any) => void) => () => void;
  onGateEvent: (callback: (event: any) => void) => () => void;
  emitOrderReady: (orderId: string) => void;
  emitPickupArrived: (orderId: string, spot: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const onOrderUpdate = useCallback((callback: (order: any) => void) => {
    if (!socket) return () => {};
    socket.on('order:update', callback);
    return () => socket.off('order:update', callback);
  }, [socket]);

  const onVetAlert = useCallback((callback: (check: any) => void) => {
    if (!socket) return () => {};
    socket.on('vet:alert', callback);
    return () => socket.off('vet:alert', callback);
  }, [socket]);

  const onGateEvent = useCallback((callback: (event: any) => void) => {
    if (!socket) return () => {};
    socket.on('gate:event', callback);
    return () => socket.off('gate:event', callback);
  }, [socket]);

  const emitOrderReady = useCallback((orderId: string) => {
    socket?.emit('order:ready', { orderId });
  }, [socket]);

  const emitPickupArrived = useCallback((orderId: string, spot: string) => {
    socket?.emit('pickup:arrived', { orderId, spot });
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onOrderUpdate, onVetAlert, onGateEvent, emitOrderReady, emitPickupArrived }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}