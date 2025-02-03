import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginDevice extends Document {
    userId: mongoose.Types.ObjectId;
    deviceId: string;
    deviceInfo: {
        userAgent: string;
        browser: string;
        os: string;
        ip: string;
    };
    isVerified: boolean;
    lastUsed: Date;
    createdAt: Date;
}

const loginDeviceSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deviceId: {
        type: String,
        required: true
    },
    deviceInfo: {
        userAgent: String,
        browser: String,
        os: String,
        ip: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for quick lookups
loginDeviceSchema.index({ userId: 1, deviceId: 1 });
loginDeviceSchema.index({ lastUsed: 1 });

export const LoginDevice = mongoose.model<ILoginDevice>('LoginDevice', loginDeviceSchema); 