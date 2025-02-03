import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { PasswordReset } from '../models/PasswordReset';
import { generateToken } from '../utils/token.utils';
import { emailService } from '../services/email.service';
import bcrypt from 'bcrypt';

const router = Router();

// Request password reset
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // For security, don't reveal if email exists
            res.json({ 
                message: 'If your email is registered, you will receive a password reset link.' 
            });
            return;
        }

        // Generate unique token
        const token = generateToken();

        // Save reset token
        await PasswordReset.create({
            userId: user._id,
            token: token
        });

        // Send reset email
        await emailService.sendPasswordResetEmail(user.email, token);

        res.json({ 
            message: 'If your email is registered, you will receive a password reset link.' 
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ 
            message: 'Error processing password reset request' 
        });
    }
});

// Reset password with token
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, newPassword } = req.body;

        const resetRequest = await PasswordReset.findOne({
            token,
            used: false,
            expiresAt: { $gt: new Date() }
        });

        if (!resetRequest) {
            res.status(400).json({ 
                message: 'Invalid or expired reset token' 
            });
            return;
        }

        // Get user and update password
        const user = await User.findById(resetRequest.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        // Mark token as used
        resetRequest.used = true;
        await resetRequest.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ 
            message: 'Error resetting password' 
        });
    }
});

export { router as passwordRouter }; 