import { SOCKET_EVENTS } from '../config/constants.js';
import userService from '../services/userService.js';
import messageService from '../services/messageService.js';

// Mapa de usuarios conectados (nickname -> socketId)
const connectedUsers = new Map();

export function initializeSocket(io) {

    io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
        console.log(`🔌 Nuevo cliente conectado: ${socket.id}`);

        // ========================================
        // EVENTO: Usuario se une al chat
        // ========================================
        socket.on(SOCKET_EVENTS.USER_JOIN, async ({ nickname }, callback) => {
            try {
                // Validar nickname
                const validation = userService.validateNickname(nickname);
                if (!validation.valid) {
                    return callback({
                        success: false,
                        error: validation.error
                    });
                }

                const validNickname = validation.nickname;

                // Verificar si ya está conectado en memoria (sesión activa)
                if (connectedUsers.has(validNickname)) {
                    return callback({
                        success: false,
                        error: 'Este nickname ya está en uso. Por favor elige otro.'
                    });
                }

                // Verificar si existe en DB y está realmente online con otro socket
                const existingUser = await userService.getUserByNickname(validNickname);
                if (existingUser && existingUser.isOnline && existingUser.socketId !== socket.id) {
                    // Usuario existe en DB como online pero NO está en memoria
                    // Esto puede pasar si el servidor se reinició pero la DB no se limpió
                    console.log(`⚠️  Usuario "${validNickname}" estaba marcado como online en DB pero no en memoria. Limpiando...`);
                    // Permitir reconexión actualizando el socketId
                }

                // Crear/actualizar usuario en DB (esto maneja reconexiones)
                const user = await userService.createOrUpdateUser(validNickname, socket.id);

                // Guardar en memoria
                connectedUsers.set(validNickname, socket.id);
                socket.nickname = validNickname;

                // Obtener lista de usuarios online
                const onlineUsers = Array.from(connectedUsers.keys());

                // Notificar a TODOS los clientes la lista actualizada
                io.emit(SOCKET_EVENTS.USERS_LIST, onlineUsers);

                // Confirmar al usuario que se unió exitosamente
                callback({
                    success: true,
                    user: {
                        nickname: validNickname,
                        joinedAt: new Date()
                    },
                    onlineUsers
                });

                console.log(`✅ Usuario "${validNickname}" se unió al chat. Total online: ${onlineUsers.length}`);

            } catch (error) {
                console.error('❌ Error en user:join:', error);
                callback({
                    success: false,
                    error: error.message || 'Error al unirse al chat'
                });
            }
        });

        // ========================================
        // EVENTO: Enviar mensaje privado
        // ========================================
        socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data, callback) => {
            try {
                const { to, content, messageType, fileUrl, fileName, fileSize, mimeType, location } = data;
                const from = socket.nickname;

                // Validar autenticación
                if (!from) {
                    return callback({
                        success: false,
                        error: 'Debes iniciar sesión primero'
                    });
                }

                // Validar contenido según tipo de mensaje
                if (messageType === 'text') {
                    const validation = messageService.validateMessage(content);
                    if (!validation.valid) {
                        return callback({
                            success: false,
                            error: validation.error
                        });
                    }
                }

                // Validar destinatario
                if (!connectedUsers.has(to)) {
                    return callback({
                        success: false,
                        error: 'El usuario destinatario no está conectado'
                    });
                }

                // Crear objeto mensaje
                const messageData = {
                    from,
                    to,
                    messageType: messageType || 'text',
                    timestamp: new Date()
                };

                // Agregar campos según tipo de mensaje
                if (messageType === 'text') {
                    messageData.content = content;
                } else if (['image', 'file', 'audio'].includes(messageType)) {
                    messageData.fileUrl = fileUrl;
                    messageData.fileName = fileName;
                    messageData.fileSize = fileSize;
                    messageData.mimeType = mimeType;
                    messageData.content = fileName; // Usar filename como content para búsquedas
                } else if (messageType === 'location') {
                    messageData.location = location;
                    messageData.content = location.address || 'Ubicación compartida';
                }

                // Guardar en base de datos
                const savedMessage = await messageService.saveMessage(messageData);

                // Obtener socketId del destinatario
                const recipientSocketId = connectedUsers.get(to);

                if (recipientSocketId) {
                    // Enviar mensaje al destinatario
                    io.to(recipientSocketId).emit(SOCKET_EVENTS.MESSAGE_RECEIVED, savedMessage);

                    // Enviar notificación visual
                    let preview = '';
                    if (messageType === 'text') {
                        preview = content.substring(0, 30) + (content.length > 30 ? '...' : '');
                    } else if (messageType === 'image') {
                        preview = '📷 Imagen';
                    } else if (messageType === 'audio') {
                        preview = '🎵 Audio';
                    } else if (messageType === 'file') {
                        preview = '📎 Archivo';
                    } else if (messageType === 'location') {
                        preview = '📍 Ubicación';
                    }

                    io.to(recipientSocketId).emit(SOCKET_EVENTS.NOTIFICATION_NEW_MESSAGE, {
                        from,
                        preview,
                        messageType,
                        timestamp: messageData.timestamp
                    });

                    console.log(`📨 Mensaje de "${from}" a "${to}": ${preview}`);
                }

                // Confirmar al emisor
                callback({
                    success: true,
                    message: savedMessage
                });

            } catch (error) {
                console.error('❌ Error en message:send:', error);
                callback({
                    success: false,
                    error: error.message || 'Error al enviar mensaje'
                });
            }
        });

        // ========================================
        // EVENTO: Cargar historial de mensajes
        // ========================================
        socket.on(SOCKET_EVENTS.MESSAGES_LOAD, async ({ targetUser }, callback) => {
            try {
                const from = socket.nickname;

                if (!from) {
                    return callback({
                        success: false,
                        error: 'No autenticado'
                    });
                }

                // Obtener mensajes de la BD
                const messages = await messageService.getMessagesBetweenUsers(
                    from,
                    targetUser,
                    100 // límite de mensajes
                );

                // Devolver en orden cronológico (más antiguo primero)
                callback({
                    success: true,
                    messages: messages.reverse()
                });

                console.log(`📂 Cargados ${messages.length} mensajes entre "${from}" y "${targetUser}"`);

            } catch (error) {
                console.error('❌ Error en messages:load:', error);
                callback({
                    success: false,
                    error: error.message || 'Error al cargar mensajes'
                });
            }
        });

        // ========================================
        // EVENTO: Marcar mensajes como leídos
        // ========================================
        socket.on(SOCKET_EVENTS.MESSAGES_MARK_READ, async ({ from }) => {
            try {
                const to = socket.nickname;

                if (!to) return;

                const count = await messageService.markAsRead(from, to);

                if (count > 0) {
                    console.log(`✓ Marcados ${count} mensajes como leídos (de "${from}" a "${to}")`);
                }

            } catch (error) {
                console.error('❌ Error en messages:mark_read:', error);
            }
        });

        // ========================================
        // EVENTO: Desconexión
        // ========================================
        socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
            try {
                const nickname = socket.nickname;

                if (nickname) {
                    // Remover de memoria
                    connectedUsers.delete(nickname);

                    // Actualizar en DB
                    await userService.setUserOffline(socket.id);

                    // Notificar a todos la lista actualizada
                    const onlineUsers = Array.from(connectedUsers.keys());
                    io.emit(SOCKET_EVENTS.USERS_LIST, onlineUsers);

                    console.log(`👋 Usuario "${nickname}" se desconectó. Online: ${onlineUsers.length}`);
                } else {
                    console.log(`👋 Cliente ${socket.id} se desconectó (sin autenticar)`);
                }
            } catch (error) {
                console.error('❌ Error en disconnect:', error);
            }
        });

        // ========================================
        // MANEJO DE ERRORES
        // ========================================
        socket.on(SOCKET_EVENTS.ERROR, (error) => {
            console.error('❌ Socket error:', error);
        });

    });

    // Log cuando el servidor Socket.IO está listo
    console.log('🔌 Socket.IO inicializado correctamente');
}

// Función auxiliar para obtener usuarios conectados (útil para debugging)
export function getConnectedUsers() {
    return Array.from(connectedUsers.entries()).map(([nickname, socketId]) => ({
        nickname,
        socketId
    }));
}