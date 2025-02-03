import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { TwoFactor } from '../models/TwoFactor';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types/custom';
import { 
    generateSecret, 
    verifyToken, 
    generateBackupCodes,
    generateQRCodeUrl,
    isValidTokenFormat,
    isValidBackupCodeFormat
} from '../utils/twoFactor.utils';
import { emailService } from '../services/email.service';
import bcrypt from 'bcrypt';
import QRCode from 'qrcode';

const router = Router();

// Initialize 2FA setup
router.post('/setup', 
    authenticateToken,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            // Check if 2FA is already set up
            let twoFactor = await TwoFactor.findOne({ userId: req.user._id });
            
            if (twoFactor?.isEnabled) {
                res.status(400).json({ message: '2FA is already enabled' });
                return;
            }

            // Generate new secret and backup codes
            const secret = generateSecret();
            const backupCodes = generateBackupCodes();
            
            // Hash backup codes
            const hashedBackupCodes = await Promise.all(
                backupCodes.map(code => bcrypt.hash(code, 10))
            );

            // Create or update 2FA record
            twoFactor = await TwoFactor.findOneAndUpdate(
                { userId: req.user._id },
                { 
                    secret,
                    backupCodes: hashedBackupCodes,
                    isEnabled: false
                },
                { upsert: true, new: true }
            );

            // Generate QR code
            const otpauthUrl = generateQRCodeUrl(req.user.email, secret);
            const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

            // Send backup codes via email
            await emailService.send2FABackupCodesEmail(req.user.email, backupCodes);

            res.json({
                message: '2FA setup initialized',
                secret,
                qrCode: qrCodeDataUrl,
                backupCodes
            });
        } catch (error) {
            console.error('Error setting up 2FA:', error);
            res.status(500).json({ 
                message: 'Error setting up 2FA',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
);

// Verify and enable 2FA
router.post('/verify', 
    authenticateToken,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { token } = req.body;
            
            const twoFactor = await TwoFactor.findOne({ userId: req.user._id });
            
            if (!twoFactor) {
                res.status(404).json({ message: '2FA not set up' });
                return;
            }

            if (twoFactor.isEnabled) {
                res.status(400).json({ message: '2FA is already enabled' });
                return;
            }

            // Verify the token
            const isValid = verifyToken(token, twoFactor.secret);
            
            if (!isValid) {
                res.status(400).json({ message: 'Invalid verification code' });
                return;
            }

            // Enable 2FA
            twoFactor.isEnabled = true;
            twoFactor.verifiedAt = new Date();
            await twoFactor.save();

            // Send confirmation email
            await emailService.send2FAEnabledEmail(req.user.email);

            res.json({ message: '2FA enabled successfully' });
        } catch (error) {
            console.error('Error verifying 2FA:', error);
            res.status(500).json({ 
                message: 'Error verifying 2FA',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
);

// Disable 2FA
router.post('/disable',
    authenticateToken,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { token } = req.body;
            
            const twoFactor = await TwoFactor.findOne({ userId: req.user._id });
            
            if (!twoFactor || !twoFactor.isEnabled) {
                res.status(400).json({ message: '2FA is not enabled' });
                return;
            }

            // Verify the token
            const isValid = verifyToken(token, twoFactor.secret);
            
            if (!isValid) {
                res.status(400).json({ message: 'Invalid verification code' });
                return;
            }

            // Disable 2FA
            await TwoFactor.findByIdAndDelete(twoFactor._id);

            // Send confirmation email
            await emailService.send2FADisabledEmail(req.user.email);

            res.json({ message: '2FA disabled successfully' });
        } catch (error) {
            console.error('Error disabling 2FA:', error);
            res.status(500).json({ 
                message: 'Error disabling 2FA',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
);

// Verify 2FA token during login
router.post('/validate',
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { userId, token, isBackupCode } = req.body;
            
            const twoFactor = await TwoFactor.findOne({ userId });
            
            if (!twoFactor || !twoFactor.isEnabled) {
                res.status(400).json({ message: '2FA is not enabled' });
                return;
            }

            let isValid = false;

            if (isBackupCode) {
                // Check backup codes
                const backupCodeIndex = await Promise.all(
                    twoFactor.backupCodes.map((hash, index) => 
                        bcrypt.compare(token, hash).then(match => match ? index : -1)
                    )
                ).then(results => results.find(index => index !== -1));

                if (backupCodeIndex !== undefined) {
                    // Remove used backup code
                    twoFactor.backupCodes.splice(backupCodeIndex, 1);
                    isValid = true;
                }
            } else {
                // Verify TOTP
                isValid = verifyToken(token, twoFactor.secret);
            }

            if (!isValid) {
                res.status(400).json({ message: 'Invalid verification code' });
                return;
            }

            twoFactor.lastUsed = new Date();
            await twoFactor.save();

            res.json({ message: '2FA validation successful' });
        } catch (error) {
            console.error('Error validating 2FA:', error);
            res.status(500).json({ 
                message: 'Error validating 2FA',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
);

export { router as twoFactorRouter }; 