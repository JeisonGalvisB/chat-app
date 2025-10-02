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

// Cargar variables de entorno
dotenv.config();

// Crear app Express
const app = express();
const httpServer = createServer(app);

// Configurar Socket.IO
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

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ========================================
// RUTAS
// ========================================

// Upload de archivos
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

// Debug: Ver usuarios conectados (solo desarrollo)
if (process.env.NODE_ENV === 'development') {
    app.get('/api/debug/users', (req, res) => {
        res.json({
            connectedUsers: getConnectedUsers(),
            count: getConnectedUsers().length
        });
    });
}

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: 'Chat Backend API',
        version: '1.0.0',
        socketIO: 'activo'
    });
});

// ========================================
// MANEJO DE ERRORES
// ========================================
app.use(notFound);
app.use(errorHandler);

// ========================================
// INICIALIZACIÓN
// ========================================
const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        // Conectar a MongoDB
        await connectDB();

        // Limpiar usuarios offline al iniciar (evita problemas de reconexión)
        await userService.cleanupOfflineUsers();

        // Inicializar Socket.IO
        initializeSocket(io);

        // Iniciar servidor
        httpServer.listen(PORT, () => {
            console.log('');
            console.log('='.repeat(50));
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
            console.log(`🔌 Socket.IO listo para conexiones`);
            console.log('='.repeat(50));
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error al iniciar servidor:', error);
        process.exit(1);
    }
}

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM recibido, cerrando servidor...');
    httpServer.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

// Iniciar servidor
startServer();