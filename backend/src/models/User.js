import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: [true, 'El nickname es requerido'],
        unique: true,
        trim: true,
        minlength: [3, 'El nickname debe tener al menos 3 caracteres'],
        maxlength: [20, 'El nickname no puede tener más de 20 caracteres'],
        match: [/^[a-zA-Z0-9_]+$/, 'El nickname solo puede contener letras, números y guiones bajos']
    },
    socketId: {
        type: String,
        required: false,
        default: null
    },
    isOnline: {
        type: Boolean,
        default: true
    },
    lastSeen: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índice para búsquedas rápidas
userSchema.index({ nickname: 1 });
userSchema.index({ socketId: 1 });

export default mongoose.model('User', userSchema);