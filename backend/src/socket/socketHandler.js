import { SOCKET_EVENTS } from '../config/constants.js';
import userService from '../services/userService.js';
import messageService from '../services/messageService.js';

// Map of connected users (nickname -> socketId)
const connectedUsers = new Map();

export function initializeSocket(io) {

    io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        // ========================================
        // EVENT: User joins chat
        // ========================================
        socket.on(SOCKET_EVENTS.USER_JOIN, async ({ nickname }, callback) => {
            try {
                // Validate nickname
                const validation = userService.validateNickname(nickname);
                if (!validation.valid) {
                    return callback({
                        success: false,
                        error: validation.error
                    });
                }

                const validNickname = validation.nickname;

                // Check if already connected in memory (active session)
                if (connectedUsers.has(validNickname)) {
                    return callback({
                        success: false,
                        error: 'This nickname is already in use. Please choose another.'
                    });
                }

                // Check if exists in DB and is really online with another socket
                const existingUser = await userService.getUserByNickname(validNickname);
                if (existingUser && existingUser.isOnline && existingUser.socketId !== socket.id) {
                    // User exists in DB as online but NOT in memory
                    // This can happen if server restarted but DB wasn't cleaned
                    console.log(`⚠️  User "${validNickname}" was marked as online in DB but not in memory. Cleaning...`);
                    // Allow reconnection by updating socketId
                }

                // Create/update user in DB (this handles reconnections)
                const user = await userService.createOrUpdateUser(validNickname, socket.id);

                // Save in memory
                connectedUsers.set(validNickname, socket.id);
                socket.nickname = validNickname;

                // Get online users list
                const onlineUsers = Array.from(connectedUsers.keys());

                // Notify ALL clients with updated list
                io.emit(SOCKET_EVENTS.USERS_LIST, onlineUsers);

                // Confirm user joined successfully
                callback({
                    success: true,
                    user: {
                        nickname: validNickname,
                        joinedAt: new Date()
                    },
                    onlineUsers
                });

                console.log(`✅ User "${validNickname}" joined chat. Total online: ${onlineUsers.length}`);

            } catch (error) {
                console.error('❌ Error in user:join:', error);
                callback({
                    success: false,
                    error: error.message || 'Error joining chat'
                });
            }
        });

        // ========================================
        // EVENT: Send private message
        // ========================================
        socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data, callback) => {
            try {
                const { to, content, messageType, fileUrl, fileName, fileSize, mimeType, location } = data;
                const from = socket.nickname;

                // Validate authentication
                if (!from) {
                    return callback({
                        success: false,
                        error: 'You must log in first'
                    });
                }

                // Validate content based on message type
                if (messageType === 'text') {
                    const validation = messageService.validateMessage(content);
                    if (!validation.valid) {
                        return callback({
                            success: false,
                            error: validation.error
                        });
                    }
                }

                // Validate recipient
                if (!connectedUsers.has(to)) {
                    return callback({
                        success: false,
                        error: 'The recipient user is not connected'
                    });
                }

                // Create message object
                const messageData = {
                    from,
                    to,
                    messageType: messageType || 'text',
                    timestamp: new Date()
                };

                // Add fields based on message type
                if (messageType === 'text') {
                    messageData.content = content;
                } else if (['image', 'file', 'audio'].includes(messageType)) {
                    messageData.fileUrl = fileUrl;
                    messageData.fileName = fileName;
                    messageData.fileSize = fileSize;
                    messageData.mimeType = mimeType;
                    messageData.content = fileName; // Use filename as content for searches
                } else if (messageType === 'location') {
                    messageData.location = location;
                    messageData.content = location.address || 'Shared location';
                }

                // Save to database
                const savedMessage = await messageService.saveMessage(messageData);

                // Get recipient's socketId
                const recipientSocketId = connectedUsers.get(to);

                if (recipientSocketId) {
                    // Send message to recipient
                    io.to(recipientSocketId).emit(SOCKET_EVENTS.MESSAGE_RECEIVED, savedMessage);

                    // Send visual notification
                    let preview = '';
                    if (messageType === 'text') {
                        preview = content.substring(0, 30) + (content.length > 30 ? '...' : '');
                    } else if (messageType === 'image') {
                        preview = '📷 Image';
                    } else if (messageType === 'audio') {
                        preview = '🎵 Audio';
                    } else if (messageType === 'file') {
                        preview = '📎 File';
                    } else if (messageType === 'location') {
                        preview = '📍 Location';
                    }

                    io.to(recipientSocketId).emit(SOCKET_EVENTS.NOTIFICATION_NEW_MESSAGE, {
                        from,
                        preview,
                        messageType,
                        timestamp: messageData.timestamp
                    });

                    console.log(`📨 Message from "${from}" to "${to}": ${preview}`);
                }

                // Confirm to sender
                callback({
                    success: true,
                    message: savedMessage
                });

            } catch (error) {
                console.error('❌ Error in message:send:', error);
                callback({
                    success: false,
                    error: error.message || 'Error sending message'
                });
            }
        });

        // ========================================
        // EVENT: Load message history
        // ========================================
        socket.on(SOCKET_EVENTS.MESSAGES_LOAD, async ({ targetUser }, callback) => {
            try {
                const from = socket.nickname;

                if (!from) {
                    return callback({
                        success: false,
                        error: 'Not authenticated'
                    });
                }

                // Get messages from DB
                const messages = await messageService.getMessagesBetweenUsers(
                    from,
                    targetUser,
                    100 // message limit
                );

                // Return in chronological order (oldest first)
                callback({
                    success: true,
                    messages: messages.reverse()
                });

                console.log(`📂 Loaded ${messages.length} messages between "${from}" and "${targetUser}"`);

            } catch (error) {
                console.error('❌ Error in messages:load:', error);
                callback({
                    success: false,
                    error: error.message || 'Error loading messages'
                });
            }
        });

        // ========================================
        // EVENT: Mark messages as read
        // ========================================
        socket.on(SOCKET_EVENTS.MESSAGES_MARK_READ, async ({ from }) => {
            try {
                const to = socket.nickname;

                if (!to) return;

                const count = await messageService.markAsRead(from, to);

                if (count > 0) {
                    console.log(`✓ Marked ${count} messages as read (from "${from}" to "${to}")`);
                }

            } catch (error) {
                console.error('❌ Error in messages:mark_read:', error);
            }
        });

        // ========================================
        // EVENT: Disconnection
        // ========================================
        socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
            try {
                const nickname = socket.nickname;

                if (nickname) {
                    // Remove from memory
                    connectedUsers.delete(nickname);

                    // Update in DB
                    await userService.setUserOffline(socket.id);

                    // Notify everyone with updated list
                    const onlineUsers = Array.from(connectedUsers.keys());
                    io.emit(SOCKET_EVENTS.USERS_LIST, onlineUsers);

                    console.log(`👋 User "${nickname}" disconnected. Online: ${onlineUsers.length}`);
                } else {
                    console.log(`👋 Client ${socket.id} disconnected (not authenticated)`);
                }
            } catch (error) {
                console.error('❌ Error in disconnect:', error);
            }
        });

        // ========================================
        // ERROR HANDLING
        // ========================================
        socket.on(SOCKET_EVENTS.ERROR, (error) => {
            console.error('❌ Socket error:', error);
        });

    });

    // Log when Socket.IO server is ready
    console.log('🔌 Socket.IO initialized successfully');
}

// Helper function to get connected users (useful for debugging)
export function getConnectedUsers() {
    return Array.from(connectedUsers.entries()).map(([nickname, socketId]) => ({
        nickname,
        socketId
    }));
}