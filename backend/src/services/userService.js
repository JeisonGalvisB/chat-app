import User from '../models/User.js';

class UserService {
    /**
     * Create or update user
     */
    async createOrUpdateUser(nickname, socketId) {
        try {
            const user = await User.findOneAndUpdate(
                { nickname },
                {
                    socketId,
                    isOnline: true,
                    lastSeen: new Date()
                },
                {
                    upsert: true,
                    new: true,
                    runValidators: true
                }
            );

            return user;
        } catch (error) {
            if (error.code === 11000) {
                throw new Error('The nickname is already in use');
            }
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    /**
     * Get all online users
     */
    async getOnlineUsers() {
        try {
            const users = await User.find({ isOnline: true })
                .select('nickname socketId lastSeen')
                .lean();

            return users;
        } catch (error) {
            throw new Error(`Error getting users: ${error.message}`);
        }
    }

    /**
     * Find user by socketId
     */
    async getUserBySocketId(socketId) {
        try {
            return await User.findOne({ socketId }).lean();
        } catch (error) {
            throw new Error(`Error finding user: ${error.message}`);
        }
    }

    /**
     * Find user by nickname
     */
    async getUserByNickname(nickname) {
        try {
            return await User.findOne({ nickname }).lean();
        } catch (error) {
            throw new Error(`Error finding user: ${error.message}`);
        }
    }

    /**
     * Mark user as offline
     */
    async setUserOffline(socketId) {
        try {
            const user = await User.findOneAndUpdate(
                { socketId },
                {
                    isOnline: false,
                    lastSeen: new Date(),
                    socketId: null // Clear socketId to allow reconnection
                },
                { new: true }
            );

            return user;
        } catch (error) {
            throw new Error(`Error disconnecting user: ${error.message}`);
        }
    }

    /**
     * Mark user as offline by nickname
     */
    async setUserOfflineByNickname(nickname) {
        try {
            const user = await User.findOneAndUpdate(
                { nickname },
                {
                    isOnline: false,
                    lastSeen: new Date(),
                    socketId: null
                },
                { new: true }
            );

            return user;
        } catch (error) {
            throw new Error(`Error disconnecting user: ${error.message}`);
        }
    }

    /**
     * Clean up offline users when starting the server
     */
    async cleanupOfflineUsers() {
        try {
            const result = await User.updateMany(
                { isOnline: false },
                { socketId: null }
            );

            console.log(`🧹 Offline user cleanup: ${result.modifiedCount} records updated`);
            return result;
        } catch (error) {
            console.error('❌ Error cleaning offline users:', error);
            throw new Error(`Error cleaning users: ${error.message}`);
        }
    }

    /**
     * Mark all users as offline (useful when restarting server)
     */
    async setAllUsersOffline() {
        try {
            const result = await User.updateMany(
                {},
                {
                    isOnline: false,
                    socketId: null,
                    lastSeen: new Date()
                }
            );

            console.log(`🔄 All users marked as offline: ${result.modifiedCount} users`);
            return result;
        } catch (error) {
            console.error('❌ Error marking users offline:', error);
            throw new Error(`Error updating users: ${error.message}`);
        }
    }

    /**
     * Validate nickname
     */
    validateNickname(nickname) {
        if (!nickname || typeof nickname !== 'string') {
            return { valid: false, error: 'Nickname is required' };
        }

        const trimmedNick = nickname.trim();

        if (trimmedNick.length < 3) {
            return { valid: false, error: 'Nickname must be at least 3 characters' };
        }

        if (trimmedNick.length > 20) {
            return { valid: false, error: 'Nickname cannot be more than 20 characters' };
        }

        if (!/^[a-zA-Z0-9_]+$/.test(trimmedNick)) {
            return { valid: false, error: 'Nickname can only contain letters, numbers and underscores' };
        }

        return { valid: true, nickname: trimmedNick };
    }
}

export default new UserService();