import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/custom';
import { TwoFactor } from '../models/TwoFactor';
import { verifyToken, isValidTokenFormat, isValidBackupCodeFormat } from '../utils/twoFactor.utils';
import bcrypt from 'bcrypt';

export const require2FA = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const twoFactor = await TwoFactor.findOne({ userId: req.user._id });

        if (!twoFactor?.isEnabled) {
            next();
            return;
        }

        const { twoFactorToken, isBackupCode } = req.body;

        if (!twoFactorToken) {
            res.status(401).json({
                message: '2FA token required',
                requires2FA: true
            });
            return;
        }

        // Validate token format
        if (isBackupCode) {
            if (!isValidBackupCodeFormat(twoFactorToken)) {
                res.status(400).json({ message: 'Invalid backup code format' });
                return;
            }
        } else {
            if (!isValidTokenFormat(twoFactorToken)) {
                res.status(400).json({ message: 'Invalid token format' });
                return;
            }
        }

        // Verify token
        const isValid = isBackupCode
            ? await verifyBackupCode(twoFactorToken, twoFactor)
            : verifyToken(twoFactorToken, twoFactor.secret);

        if (!isValid) {
            res.status(401).json({ message: 'Invalid 2FA token' });
            return;
        }

        next();
    } catch (error) {
        console.error('2FA middleware error:', error);
        res.status(500).json({ 
            message: 'Error validating 2FA',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

async function verifyBackupCode(code: string, twoFactor: any): Promise<boolean> {
    const backupCodeIndex = await Promise.all(
        twoFactor.backupCodes.map((hash: string, index: number) => 
            bcrypt.compare(code, hash).then(match => match ? index : -1)
        )
    ).then(results => results.find(index => index !== -1));

    if (backupCodeIndex !== undefined) {
        // Remove used backup code
        twoFactor.backupCodes.splice(backupCodeIndex, 1);
        await twoFactor.save();
        return true;
    }

    return false;
} 