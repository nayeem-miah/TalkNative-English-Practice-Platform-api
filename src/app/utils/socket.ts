import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

import { handleCallSockets } from '../modules/call/call.socket';

let io: SocketServer;

export const initializeSocket = (server: HttpServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('👤 New client connected:', socket.id);

    // Initialize module-specific sockets
    handleCallSockets(socket);

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
