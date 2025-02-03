import mongoose, { Schema, Document } from 'mongoose';

export interface IAccountRecovery extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    questions: Array<{
        question: string;
        answer: string;
    }>;
    recoveryEmail?: string;
    expiresAt: Date;
    used: boolean;
}

const accountRecoverySchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    questions: [{
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        }
    }],
    recoveryEmail: {
        type: String
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    },
    used: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Add indexes
accountRecoverySchema.index({ token: 1 });
accountRecoverySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AccountRecovery = mongoose.model<IAccountRecovery>('AccountRecovery', accountRecoverySchema); 