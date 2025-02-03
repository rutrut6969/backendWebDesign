import mongoose, { Schema, Document, model } from 'mongoose';
import bcryptjs from 'bcryptjs';

export type SuspensionCategory = 'VIOLATION' | 'SPAM' | 'ABUSE' | 'SECURITY' | 'OTHER';

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    role: 'owner' | 'admin' | 'user';
    isActive: boolean;
    suspendedAt?: Date;
    suspendedBy?: any;
    suspensionReason?: string;
    profileImage?: string;
    phoneNumber?: string;
    address?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
    suspensionCategory?: SuspensionCategory;
    suspensionEnd?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    isSuspensionExpired(): boolean;
}

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['owner', 'admin', 'user'],
        default: 'user',
    },
    phoneNumber: {
        type: String,
        default: undefined,
    },
    address: {
        type: String,
        default: undefined,
    },
    bio: {
        type: String,
        default: undefined,
    },
    profileImage: {
        type: String,
        default: undefined,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    suspendedAt: {
        type: Date,
        default: undefined
    },
    suspendedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: undefined
    },
    suspensionReason: {
        type: String,
        default: undefined
    },
    suspensionCategory: {
        type: String,
        enum: ['VIOLATION', 'SPAM', 'ABUSE', 'SECURITY', 'OTHER'],
        default: undefined
    },
    suspensionEnd: {
        type: Date,
        default: undefined
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        if (this.suspensionEnd && new Date() > this.suspensionEnd) {
            this.isActive = true;
            this.suspensionEnd = undefined;
            this.suspendedAt = undefined;
            this.suspendedBy = undefined;
            this.suspensionReason = undefined;
            this.suspensionCategory = undefined;
        }
        next();
    } catch (error) {
        next(error as Error);
    }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcryptjs.compare(candidatePassword, this.password);
}

// Add method to check if suspension is expired
userSchema.methods.isSuspensionExpired = function(): boolean {
    if (!this.suspensionEnd) return false;
    return new Date() > this.suspensionEnd;
};

export const User = model<IUser>('User', userSchema);