import { authenticator } from 'otplib';
import crypto from 'crypto';

// Generate a secret key for TOTP
export const generateSecret = (): string => {
    return authenticator.generateSecret();
};

// Verify a TOTP token
export const verifyToken = (token: string, secret: string): boolean => {
    try {
        return authenticator.verify({ token, secret });
    } catch (error) {
        return false;
    }
};

// Generate backup codes
export const generateBackupCodes = (count: number = 8): string[] => {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
        // Generate 8 character backup codes
        const code = crypto.randomBytes(4).toString('hex');
        codes.push(code);
    }
    return codes;
};

// Generate QR code data URL
export const generateQRCodeUrl = (email: string, secret: string): string => {
    const issuer = 'CodeWeaver';
    const accountName = encodeURIComponent(email);
    return `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}`;
};

// Validate token format
export const isValidTokenFormat = (token: string): boolean => {
    return /^\d{6}$/.test(token);
};

// Validate backup code format
export const isValidBackupCodeFormat = (code: string): boolean => {
    return /^[0-9a-f]{8}$/.test(code);
}; 