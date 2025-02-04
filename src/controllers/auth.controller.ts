import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { generateToken } from '../utils/jwt.utils';
import { Session } from 'express-session';

// Extend the Request interface to include the session
interface CustomRequest extends Request {
    session: Session & {
        userId?: string; // Make userId optional
    };
}

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }

        const user = new User({ email, password, name, role: 'user' });
        await user.save();
        const token = generateToken(user);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name, adminSecret } = req.body;

        if (adminSecret !== process.env.ADMIN_SECRET) {
            res.status(403).json({ message: 'Invalid admin secret' });
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }

        const user = new User({ email, password, name, role: 'admin' });
        await user.save();
        const token = generateToken(user);

        res.status(201).json({
            message: 'Admin user registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error registering admin', error });
    }
};

export const login = async (req: CustomRequest, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user: IUser | null = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Store user information in the session
        req.session.userId = user._id.toString(); // Store user ID in session

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
        res.status(500).json({ message: 'Error during login', error });
    }
};
