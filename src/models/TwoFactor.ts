import mongoose, { Schema, Document } from 'mongoose';

export interface ITwoFactor extends Document {
    userId: mongoose.Types.ObjectId;
    secret: string;
    isEnabled: boolean;
    backupCodes: string[];  // Hashed backup codes
    lastUsed?: Date;
    verifiedAt?: Date;
}

const twoFactorSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    secret: {
        type: String,
        required: true
    },
    isEnabled: {
        type: Boolean,
        default: false
    },
    backupCodes: [{
        type: String  // Store hashed backup codes
    }],
    lastUsed: {
        type: Date
    },
    verifiedAt: {
        type: Date
    }
}, {
    timestamps: true
});

export const TwoFactor = mongoose.model<ITwoFactor>('TwoFactor', twoFactorSchema); 