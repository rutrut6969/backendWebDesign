import crypto from 'crypto';

export const generateToken = (): string => {
    // Generate a random 32-byte hex string
    return crypto.randomBytes(32).toString('hex');
}; 