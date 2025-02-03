import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { AccountRecovery } from '../models/AccountRecovery';
import { generateToken } from '../utils/token.utils';
import { emailService } from '../services/email.service';
import bcrypt from 'bcrypt';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Setup recovery questions
router.post('/setup', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const { questions, recoveryEmail } = req.body;
        
        // Validate questions format
        if (!Array.isArray(questions) || questions.length < 2) {
            res.status(400).json({ message: 'At least 2 security questions are required' });
            return;
        }

        // Hash answers
        const hashedQuestions = await Promise.all(questions.map(async (q) => ({
            question: q.question,
            answer: await bcrypt.hash(q.answer.toLowerCase(), 10)
        })));

        // Create or update recovery setup
        await AccountRecovery.findOneAndUpdate(
            { userId: req.user._id },
            { 
                questions: hashedQuestions,
                recoveryEmail,
                token: generateToken(),
                used: false
            },
            { upsert: true, new: true }
        );

        res.json({ message: 'Recovery options set successfully' });
    } catch (error) {
        console.error('Error setting up recovery:', error);
        res.status(500).json({ 
            message: 'Error setting up recovery options',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Initiate account recovery
router.post('/initiate', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.json({ message: 'If your email is registered, you will receive recovery instructions.' });
            return;
        }

        const recovery = await AccountRecovery.findOne({ userId: user._id });
        
        if (!recovery) {
            res.json({ message: 'If your email is registered, you will receive recovery instructions.' });
            return;
        }

        // Generate new token
        recovery.token = generateToken();
        recovery.used = false;
        recovery.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await recovery.save();

        // Send recovery email
        await emailService.sendAccountRecoveryEmail(
            user.email,
            recovery.recoveryEmail,
            recovery.token
        );

        res.json({ message: 'If your email is registered, you will receive recovery instructions.' });
    } catch (error) {
        console.error('Error initiating recovery:', error);
        res.status(500).json({ 
            message: 'Error processing recovery request',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Verify security questions
router.post('/verify', async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, answers } = req.body;

        const recovery = await AccountRecovery.findOne({
            token,
            used: false,
            expiresAt: { $gt: new Date() }
        });

        if (!recovery) {
            res.status(400).json({ message: 'Invalid or expired recovery token' });
            return;
        }

        // Verify answers
        const correctAnswers = await Promise.all(
            answers.map(async (answer: string, index: number) => {
                return bcrypt.compare(
                    answer.toLowerCase(),
                    recovery.questions[index].answer
                );
            })
        );

        if (!correctAnswers.every(result => result)) {
            res.status(400).json({ message: 'Incorrect answers to security questions' });
            return;
        }

        // Generate temporary access token
        const tempToken = generateToken();
        recovery.used = true;
        await recovery.save();

        res.json({
            message: 'Security questions verified successfully',
            tempToken
        });
    } catch (error) {
        console.error('Error verifying recovery:', error);
        res.status(500).json({ 
            message: 'Error verifying recovery answers',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export { router as recoveryRouter }; 