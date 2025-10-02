import User from '../models/User.js';

class UserService {
    /**
     * Crear o actualizar usuario
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
                throw new Error('El nickname ya está en uso');
            }
            throw new Error(`Error al crear usuario: ${error.message}`);
        }
    }

    /**
     * Obtener todos los usuarios online
     */
    async getOnlineUsers() {
        try {
            const users = await User.find({ isOnline: true })
                .select('nickname socketId lastSeen')
                .lean();

            return users;
        } catch (error) {
            throw new Error(`Error al obtener usuarios: ${error.message}`);
        }
    }

    /**
     * Buscar usuario por socketId
     */
    async getUserBySocketId(socketId) {
        try {
            return await User.findOne({ socketId }).lean();
        } catch (error) {
            throw new Error(`Error al buscar usuario: ${error.message}`);
        }
    }

    /**
     * Buscar usuario por nickname
     */
    async getUserByNickname(nickname) {
        try {
            return await User.findOne({ nickname }).lean();
        } catch (error) {
            throw new Error(`Error al buscar usuario: ${error.message}`);
        }
    }

    /**
     * Marcar usuario como offline
     */
    async setUserOffline(socketId) {
        try {
            const user = await User.findOneAndUpdate(
                { socketId },
                {
                    isOnline: false,
                    lastSeen: new Date(),
                    socketId: null // Limpiar socketId para permitir reconexión
                },
                { new: true }
            );

            return user;
        } catch (error) {
            throw new Error(`Error al desconectar usuario: ${error.message}`);
        }
    }

    /**
     * Marcar usuario como offline por nickname
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
            throw new Error(`Error al desconectar usuario: ${error.message}`);
        }
    }

    /**
     * Limpiar usuarios offline al iniciar el servidor
     */
    async cleanupOfflineUsers() {
        try {
            const result = await User.updateMany(
                { isOnline: false },
                { socketId: null }
            );

            console.log(`🧹 Limpieza de usuarios offline: ${result.modifiedCount} registros actualizados`);
            return result;
        } catch (error) {
            console.error('❌ Error al limpiar usuarios offline:', error);
            throw new Error(`Error al limpiar usuarios: ${error.message}`);
        }
    }

    /**
     * Marcar todos los usuarios como offline (útil al reiniciar servidor)
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

            console.log(`🔄 Todos los usuarios marcados como offline: ${result.modifiedCount} usuarios`);
            return result;
        } catch (error) {
            console.error('❌ Error al marcar usuarios offline:', error);
            throw new Error(`Error al actualizar usuarios: ${error.message}`);
        }
    }

    /**
     * Validar nickname
     */
    validateNickname(nickname) {
        if (!nickname || typeof nickname !== 'string') {
            return { valid: false, error: 'El nickname es requerido' };
        }

        const trimmedNick = nickname.trim();

        if (trimmedNick.length < 3) {
            return { valid: false, error: 'El nickname debe tener al menos 3 caracteres' };
        }

        if (trimmedNick.length > 20) {
            return { valid: false, error: 'El nickname no puede tener más de 20 caracteres' };
        }

        if (!/^[a-zA-Z0-9_]+$/.test(trimmedNick)) {
            return { valid: false, error: 'El nickname solo puede contener letras, números y guiones bajos' };
        }

        return { valid: true, nickname: trimmedNick };
    }
}

export default new UserService();