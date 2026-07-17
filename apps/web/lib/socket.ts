import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (typeof window === 'undefined') {
    return {
      on: () => {},
      off: () => {},
      emit: () => {},
      disconnect: () => {},
    } as unknown as Socket;
  }

  if (!socketInstance) {
    const socketUrl = window.location.origin;
    console.log('[Socket] Initializing unified socket connection to:', socketUrl);
    socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Unified socket connected successfully:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('[Socket] Unified socket disconnected:', reason);
    });
  }

  return socketInstance;
}
