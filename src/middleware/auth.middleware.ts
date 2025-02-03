import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {environment } from '../config/environment';
import { User } from '../models/User';

interface JwtPayload {
    id: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if(!token) {
            res.status(401).json({message: 'Authentication Required'});
            return;
        }
        const decoded = jwt.verify(token, environment.jwtSecret) as JwtPayload;
        const user = await User.findById(decoded.id);

        if(!user) {
            res.status(401).json({message: 'User not found'});
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

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({message: 'Invalid Token'});
        return;
    }
}

export const isAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!['admin', 'owner'].includes(req.user?.role)) {
        res.status(403).json({ message: 'Admin Access Required' });
        return;
    }
    next();
}

// New middleware for owner-only routes
export const isOwner = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (req.user?.role !== 'owner') {
        res.status(403).json({ message: 'Owner Access Required' });
        return;
    }
    next();
}

// Add a new middleware to check if user is active
export const isActive = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user?.isActive && req.user?.role !== 'owner') {
        res.status(403).json({ 
            message: 'Account suspended',
            suspensionDetails: {
                suspendedAt: req.user?.suspendedAt,
                reason: req.user?.suspensionReason
            }
        });
        return;
    }
    next();
}



