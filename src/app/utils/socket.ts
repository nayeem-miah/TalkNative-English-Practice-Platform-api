import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import { handleCallSockets } from '../modules/call/call.socket';

import { handleChatSockets } from '../modules/chat/chat.socket';

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

    io.emit('online_count_update', { count: io.engine.clientsCount });

    // Initialize module-specific sockets
    handleCallSockets(socket);
    handleChatSockets(socket);

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
      setTimeout(() => {
        io.emit('online_count_update', { count: io.engine.clientsCount });
      }, 100);
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
