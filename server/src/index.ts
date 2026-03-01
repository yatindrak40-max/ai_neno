import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'], credentials: true } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
});

io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
    socket.on('chat-message', (data) => {
        console.log('💬 Message received:', data);
        io.emit('chat-response', { response: 'Processing...', socketId: socket.id });
    });
});

app.use((err: any, req: Request, res: Response) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 WebSocket enabled via Socket.io`);
    console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

export { app, server, io };