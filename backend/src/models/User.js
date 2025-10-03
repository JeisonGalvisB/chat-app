import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: [true, 'Nickname is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Nickname must be at least 3 characters'],
        maxlength: [20, 'Nickname cannot be more than 20 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Nickname can only contain letters, numbers and underscores']
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

// Index for fast searches
userSchema.index({ nickname: 1 });
userSchema.index({ socketId: 1 });

export default mongoose.model('User', userSchema);