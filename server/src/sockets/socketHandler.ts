import { Server as SocketIOServer, Socket } from 'socket.io';
import { sendMessageToOllama, getConversationHistory, clearConversationHistory } from '../services/ollamaService';

export const socketHandler = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log('✅ User connected:', socket.id);

    socket.emit('message', { text: 'Welcome to AI Neno!' });

    socket.on('send-message', async (data: { message: string; model?: string }) => {
      try {
        console.log('📨 Message received:', data.message);
        socket.broadcast.emit('user-typing', { userId: socket.id });
        const response = await sendMessageToOllama(data.message);
        socket.emit('receive-message', { message: response, timestamp: new Date(), model: data.model || 'llama2' });
        io.emit('message', { text: response, userId: socket.id, timestamp: new Date(), type: 'bot' });
      } catch (error) {
        console.error('❌ Error processing message:', error);
        socket.emit('error', { message: 'Failed to process message' });
      }
    });

    socket.on('get-history', () => {
      const history = getConversationHistory();
      socket.emit('history', history);
    });

    socket.on('clear-history', () => {
      clearConversationHistory();
      socket.emit('message', { text: 'Conversation history cleared.' });
    });

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
      io.emit('user-left', { userId: socket.id });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};
