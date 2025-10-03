import Message from '../models/Message.js';

class MessageService {
    /**
     * Save message
     */
    async saveMessage(messageData) {
        try {
            const message = new Message(messageData);
            return await message.save();
        } catch (error) {
            throw new Error(`Error saving message: ${error.message}`);
        }
    }

    /**
     * Get messages between two users
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
            throw new Error(`Error getting messages: ${error.message}`);
        }
    }

    /**
     * Mark messages as read
     */
    async markAsRead(from, to) {
        try {
            const result = await Message.updateMany(
                { from, to, isRead: false },
                { isRead: true }
            );

            return result.modifiedCount;
        } catch (error) {
            throw new Error(`Error marking messages: ${error.message}`);
        }
    }

    /**
     * Get number of unread messages
     */
    async getUnreadCount(to) {
        try {
            return await Message.countDocuments({ to, isRead: false });
        } catch (error) {
            throw new Error(`Error counting messages: ${error.message}`);
        }
    }

    /**
     * Validate message content
     */
    validateMessage(content) {
        if (!content || typeof content !== 'string') {
            return { valid: false, error: 'Message is required' };
        }

        const trimmedContent = content.trim();

        if (trimmedContent.length < 1) {
            return { valid: false, error: 'Message cannot be empty' };
        }

        if (trimmedContent.length > 1000) {
            return { valid: false, error: 'Message is too long (max. 1000 characters)' };
        }

        return { valid: true, content: trimmedContent };
    }
}

export default new MessageService();