import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/custom';

export const checkRole = (allowedRoles: ('owner' | 'admin' | 'user')[]) => {
    return ((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const user = req.user;

            if (!user) {
                return res.status(401).json({
                    message: 'Authentication required'
                });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    message: 'Access denied',
                    error: 'Insufficient permissions'
                });
            }

            // Check if user is suspended
            if (!user.isActive && user.role !== 'owner') {
                return res.status(403).json({
                    message: 'Account suspended',
                    error: 'Your account has been suspended',
                    suspensionReason: user.suspensionReason
                });
            }

            next();
        } catch (error: any) {
            res.status(500).json({
                message: 'Error checking role',
                error: error.message
            });
        }
    }) as any;  // Type assertion to bypass the RequestHandler type check
}; 