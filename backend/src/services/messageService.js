import Message from '../models/Message.js';

class MessageService {
    /**
     * Guardar mensaje
     */
    async saveMessage(messageData) {
        try {
            const message = new Message(messageData);
            return await message.save();
        } catch (error) {
            throw new Error(`Error al guardar mensaje: ${error.message}`);
        }
    }

    /**
     * Obtener mensajes entre dos usuarios
     */
    async getMessagesBetweenUsers(user1, user2, limit = 50) {
        try {
            const messages = await Message.find({
                $or: [
                    { from: user1, to: user2 },
                    { from: user2, to: user1 }
                ]
            })
                .sort({ timestamp: -1 })
                .limit(limit)
                .lean();

            return messages;
        } catch (error) {
            throw new Error(`Error al obtener mensajes: ${error.message}`);
        }
    }

    /**
     * Marcar mensajes como leídos
     */
    async markAsRead(from, to) {
        try {
            const result = await Message.updateMany(
                { from, to, isRead: false },
                { isRead: true }
            );

            return result.modifiedCount;
        } catch (error) {
            throw new Error(`Error al marcar mensajes: ${error.message}`);
        }
    }

    /**
     * Obtener número de mensajes no leídos
     */
    async getUnreadCount(to) {
        try {
            return await Message.countDocuments({ to, isRead: false });
        } catch (error) {
            throw new Error(`Error al contar mensajes: ${error.message}`);
        }
    }

    /**
     * Validar contenido del mensaje
     */
    validateMessage(content) {
        if (!content || typeof content !== 'string') {
            return { valid: false, error: 'El mensaje es requerido' };
        }

        const trimmedContent = content.trim();

        if (trimmedContent.length < 1) {
            return { valid: false, error: 'El mensaje no puede estar vacío' };
        }

        if (trimmedContent.length > 1000) {
            return { valid: false, error: 'El mensaje es demasiado largo (máx. 1000 caracteres)' };
        }

        return { valid: true, content: trimmedContent };
    }
}

export default new MessageService();