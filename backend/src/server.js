import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import { initializeSocket, getConnectedUsers } from './socket/socketHandler.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import userService from './services/userService.js';
import uploadRoutes from './routes/uploadRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = createServer(app);

// Configure Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ========================================
// ROUTES
// ========================================

// File upload
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// Debug: View connected users (development only)
if (process.env.NODE_ENV === 'development') {
    app.get('/api/debug/users', (req, res) => {
        res.json({
            connectedUsers: getConnectedUsers(),
            count: getConnectedUsers().length
        });
    });
}

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Chat Backend API',
        version: '1.0.0',
        socketIO: 'active'
    });
});

// ========================================
// ERROR HANDLING
// ========================================
app.use(notFound);
app.use(errorHandler);

// ========================================
// INITIALIZATION
// ========================================
const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        // Connect to MongoDB
        await connectDB();

        // Clean up offline users on startup (prevents reconnection issues)
        await userService.cleanupOfflineUsers();

        // Initialize Socket.IO
        initializeSocket(io);

        // Start server
        httpServer.listen(PORT, () => {
            console.log('');
            console.log('='.repeat(50));
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔌 Socket.IO ready for connections`);
            console.log('='.repeat(50));
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, closing server...');
    httpServer.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});

// Start server
startServer();