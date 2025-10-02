import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    from: {
        type: String,
        required: [true, 'El remitente es requerido'],
        ref: 'User'
    },
    to: {
        type: String,
        required: [true, 'El destinatario es requerido'],
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
        minlength: [1, 'El mensaje no puede estar vacío'],
        maxlength: [1000, 'El mensaje es demasiado largo']
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

// Índice compuesto para búsquedas eficientes de conversaciones
messageSchema.index({ from: 1, to: 1, timestamp: -1 });
messageSchema.index({ to: 1, isRead: 1 });

export default mongoose.model('Message', messageSchema);