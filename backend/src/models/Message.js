import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    from: {
        type: String,
        required: [true, 'Sender is required'],
        ref: 'User'
    },
    to: {
        type: String,
        required: [true, 'Recipient is required'],
        ref: 'User'
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file', 'audio', 'location'],
        default: 'text',
        required: true
    },
    content: {
        type: String,
        required: function() {
            return this.messageType === 'text' || this.messageType === 'location';
        },
        trim: true,
        minlength: [1, 'Message cannot be empty'],
        maxlength: [1000, 'Message is too long']
    },
    fileUrl: {
        type: String,
        required: function() {
            return ['image', 'file', 'audio'].includes(this.messageType);
        }
    },
    fileName: {
        type: String
    },
    fileSize: {
        type: Number
    },
    mimeType: {
        type: String
    },
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index for efficient conversation searches
messageSchema.index({ from: 1, to: 1, timestamp: -1 });
messageSchema.index({ to: 1, isRead: 1 });

export default mongoose.model('Message', messageSchema);