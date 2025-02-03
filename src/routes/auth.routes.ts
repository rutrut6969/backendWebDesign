import { Router, Request, Response } from 'express';
import { register, registerAdmin, login } from '../controllers/auth.controller';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { environment } from '../config/environment';
import { generateToken } from '../utils/jwt.utils';

const router: Router = Router();

// Auth Routes
router.post('/register', register);
router.post('/register/admin', registerAdmin);
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
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

export { router as authRouter };