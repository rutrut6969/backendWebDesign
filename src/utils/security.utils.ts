import crypto from 'crypto';
import UAParser from 'ua-parser-js';
import { Request } from 'express';

export const generateDeviceId = (req: Request): string => {
    const parser = new UAParser(req.headers['user-agent']);
    const ua = parser.getResult();
    
    // Create a unique device fingerprint
    const fingerprint = [
        ua.browser.name,
        ua.browser.version,
        ua.os.name,
        ua.os.version,
        req.ip
    ].join('|');
    
    return crypto.createHash('sha256').update(fingerprint).digest('hex');
};

export const getDeviceInfo = (req: Request) => {
    const parser = new UAParser(req.headers['user-agent']);
    const ua = parser.getResult();
    
    return {
        userAgent: req.headers['user-agent'] || 'Unknown',
        browser: `${ua.browser.name} ${ua.browser.version}`,
        os: `${ua.os.name} ${ua.os.version}`,
        ip: req.ip || 'Unknown'
    };
};

export const isSuspiciousLogin = async (userId: string, deviceId: string): Promise<boolean> => {
    const device = await LoginDevice.findOne({ userId, deviceId });
    if (!device) return true;
    
    // Check if device hasn't been used in 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return device.lastUsed < thirtyDaysAgo;
}; 