import { Router, Request, Response } from 'express';
import { register, registerAdmin, login } from '../controllers/auth.controller';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { environment } from '../config/environment';
import { generateToken } from '../utils/jwt.utils';
import { TwoFactor } from '../models/TwoFactor';
import { emailService } from '../services/email.service';
import bcrypt from 'bcrypt';
import { verifyToken } from '../utils/twoFactor.utils';

const router: Router = Router();

// Auth Routes
router.post('/register', register);
router.post('/register/admin', registerAdmin);
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, twoFactorToken, isBackupCode } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Check if user has 2FA enabled
        const twoFactor = await TwoFactor.findOne({ userId: user._id });
        
        if (twoFactor?.isEnabled) {
            if (!twoFactorToken) {
                res.status(401).json({
                    message: '2FA token required',
                    requires2FA: true,
                    userId: user._id
                });
                return;
            }

            // Validate 2FA token
            const isValid = isBackupCode
                ? await verifyBackupCode(twoFactorToken, twoFactor)
                : verifyToken(twoFactorToken, twoFactor.secret);

            if (!isValid) {
                res.status(401).json({ message: 'Invalid 2FA token' });
                return;
            }

            // Update last used timestamp
            twoFactor.lastUsed = new Date();
            await twoFactor.save();

            // Send login alert email
            await emailService.send2FALoginAlertEmail(
                user.email,
                req.headers['user-agent'] || 'Unknown device',
                req.ip || 'Unknown location'
            );
        }

        // Check if user is suspended
        if (!user.isActive && user.role !== 'owner') {
            res.status(403).json({ 
                message: 'Account suspended',
                suspensionDetails: {
                    suspendedAt: user.suspendedAt,
                    reason: user.suspensionReason
                }
            });
            return;
        }

        // Generate JWT token
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Error during login',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Initial owner setup route
router.post('/setup-owner', async (req: Request, res: Response): Promise<void> => {
    try {
        // Check if owner already exists
        const existingOwner = await User.findOne({ role: 'owner' });
        if (existingOwner) {
            res.status(400).json({ message: 'Owner account already exists' });
            return;
        }

        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }

        // Create owner account
        const owner = new User({
            email,
            password,
            name,
            role: 'owner'
        });

        await owner.save();

        // Generate token using the utility function
        const token = generateToken(owner);

        res.status(201).json({
            message: 'Owner account created successfully',
            user: {
                id: owner._id,
                email: owner.email,
                name: owner.name,
                role: owner.role
            },
            token
        });
    } catch (error) {
        console.error('Error creating owner account:', error);
        res.status(500).json({ 
            message: 'Error creating owner account',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Helper function for verifying backup codes
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

export { router as authRouter };