'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket<T>(event: string, handler: (data: T) => void): void {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to the same origin
    const socket = io(window.location.origin);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[socket-client] connected: ${socket.id}`);
    });

    socket.on(event, handler);

    return () => {
      console.log(`[socket-client] disconnecting: ${socket.id}`);
      socket.off(event, handler);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [event, handler]);
}
