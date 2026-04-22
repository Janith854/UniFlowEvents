require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose'); // Added to handle clean disconnection

// Use 5002 if 5001 is being stubborn, or pull from .env
const PORT = process.env.PORT || 5002;

const startServer = async () => {
    try {
        // 1. Connect to MongoDB Atlas
        // Ensure your .env has MONGO_URI=mongodb+srv://...
        await connectDB();
        console.log('🍃 MongoDB Atlas connection established');

        // 2. Initialize HTTP Server
        const server = http.createServer(app);

        // 3. Initialize Socket.io
        const io = new Server(server, {
            cors: {
                origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
                methods: ["GET", "POST", "PUT", "DELETE"],
                credentials: true
            }
        });

        // Make io accessible in your routes via req.app.get('io')
        app.set('io', io);

        // Basic Socket Authentication Middleware
        io.use((socket, next) => {
            const token = socket.handshake.auth?.token;
            if (!token) {
                console.warn('⚠️ Rejected unauthenticated socket connection');
                return next(new Error('Authentication error: Token required'));
            }
            next();
        });

        io.on('connection', (socket) => {
            console.log('🔗 WebSocket Client connected:', socket.id);
            socket.on('disconnect', () => {
                console.log('❌ WebSocket Client disconnected:', socket.id);
            });
        });

        // 4. Start Listening
        server.listen(PORT, () => {
            console.log(`🚀 Server with WebSockets live on port ${PORT}`);
        });

        // 5. Handle "Address In Use" errors gracefully
        server.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use. Please kill the process or change the port in .env`);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('💥 Server startup failed:', error.message);
        process.exit(1);
    }
};

// Graceful shutdown: Closes DB connection and exits when you press Ctrl+C
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed. Server shutting down.');
    process.exit(0);
});

startServer();