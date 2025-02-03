import { Router, Response } from 'express';
import { authenticateToken, isAdmin, isOwner } from '../middleware/auth.middleware';
import { User } from '../models/User';
import { sendSuspensionEmail } from '../utils/email.utils';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from '../types/custom';
import { Request } from 'express';

const router: Router = Router();

// Get all users (filtered based on admin role)
router.get('/users', 
    authenticateToken, 
    isAdmin, 
    async (req: Request, res: Response): Promise<void> => {
        try {
            let users;
            if (req.user.role === 'owner') {
                // Owner can see all users
                users = await User.find()
                    .select('-password')
                    .populate('suspendedBy', 'name email'); // Add suspended by details
            } else {
                // Regular admins can only see non-admin users
                users = await User.find({ role: 'user' })
                    .select('-password')
                    .populate('suspendedBy', 'name email');
            }
            
            // Format user data with suspension info
            const formattedUsers = users.map(user => ({
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: {
                    isActive: user.isActive,
                    ...(user.isActive ? {} : {
                        suspendedAt: user.suspendedAt,
                        suspendedBy: user.suspendedBy,
                        suspensionReason: user.suspensionReason
                    })
                },
                profileImage: user.profileImage,
                phoneNumber: user.phoneNumber,
                address: user.address,
                bio: user.bio,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }));
            
            res.json({
                message: 'Users retrieved successfully',
                users: formattedUsers
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ 
                message: 'Error fetching users',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
);

// Get specific user (with role-based access)
router.get('/users/:id', 
    authenticateToken, 
    isAdmin, 
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const requestedUser = await User.findById(req.params.id)
                .select('-password')
                .populate('suspendedBy', 'name email');
            
            if (!requestedUser) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            // Check permissions
            if (req.user.role !== 'owner' && requestedUser.role === 'admin') {
                res.status(403).json({ 
                    message: 'Access denied: Cannot view admin user details' 
                });
                return;
            }

            const userResponse = {
                id: requestedUser._id,
                email: requestedUser.email,
                name: requestedUser.name,
                role: requestedUser.role,
                status: {
                    isActive: requestedUser.isActive,
                    ...(requestedUser.isActive ? {} : {
                        suspendedAt: requestedUser.suspendedAt,
                        suspendedBy: requestedUser.suspendedBy,
                        suspensionReason: requestedUser.suspensionReason
                    })
                },
                profileImage: requestedUser.profileImage,
                phoneNumber: requestedUser.phoneNumber,
                address: requestedUser.address,
                bio: requestedUser.bio,
                createdAt: requestedUser.createdAt,
                updatedAt: requestedUser.updatedAt
            };

            res.json({
                message: 'User retrieved successfully',
                user: userResponse
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ 
                message: 'Error fetching user',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
);

// Owner-only routes

// Update user role (owner only)
router.patch('/users/:id/role', 
    authenticateToken,
    isOwner,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { role } = req.body;
            
            // Validate role
            if (!['admin', 'user'].includes(role)) {
                res.status(400).json({ message: 'Invalid role specified' });
                return;
            }

            const user = await User.findById(req.params.id);
            
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            // Prevent changing owner's role
            if (user.role === 'owner') {
                res.status(403).json({ message: 'Cannot modify owner role' });
                return;
            }

            user.role = role;
            await user.save();

            res.json({
                message: 'User role updated successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Error updating user role:', error);
            res.status(500).json({ 
                message: 'Error updating user role',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
);

// Create new admin (owner only)
router.post('/create-admin',
    authenticateToken,
    isOwner,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { email, password, name } = req.body;
            
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400).json({ message: 'Email already registered' });
                return;
            }

            const user = new User({
                email,
                password,
                name,
                role: 'admin'
            });

            await user.save();

            res.status(201).json({
                message: 'Admin created successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Error creating admin:', error);
            res.status(500).json({ 
                message: 'Error creating admin',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
);

// Delete user (owner only)
router.delete('/users/:id', 
    authenticateToken,
    isOwner,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const user = await User.findById(req.params.id);
            
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            // Prevent deleting owner account
            if (user.role === 'owner') {
                res.status(403).json({ message: 'Cannot delete owner account' });
                return;
            }

            await User.findByIdAndDelete(req.params.id);
            
            res.json({
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ 
                message: 'Error deleting user',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
);

// Reset user password (owner or admin)
router.post('/users/:id/reset-password',
    authenticateToken,
    isAdmin,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const user = await User.findById(req.params.id);
            
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            // Only owner can reset admin passwords
            if (user.role === 'admin' && req.user.role !== 'owner') {
                res.status(403).json({ message: 'Only owner can reset admin passwords' });
                return;
            }

            // Generate random password or use provided one
            const newPassword = req.body.password || Math.random().toString(36).slice(-8);
            user.password = newPassword;
            await user.save();

            res.json({
                message: 'Password reset successfully',
                newPassword: newPassword // In production, send this via email
            });
        } catch (error) {
            console.error('Error resetting password:', error);
            res.status(500).json({ 
                message: 'Error resetting password',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
);

// Suspend user
router.post('/users/:id/suspend',
    authenticateToken,
    isAdmin,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { 
                reason, 
                category = 'OTHER',
                duration  // in days, optional
            } = req.body;
            
            const user = await User.findById(req.params.id);
            
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            // Prevent suspending owner
            if (user.role === 'owner') {
                res.status(403).json({ message: 'Cannot suspend owner account' });
                return;
            }

            // Regular admins can't suspend other admins
            if (user.role === 'admin' && req.user.role !== 'owner') {
                res.status(403).json({ message: 'Only owner can suspend admin accounts' });
                return;
            }

            user.isActive = false;
            user.suspendedAt = new Date();
            user.suspendedBy = req.user._id;
            user.suspensionReason = reason;
            user.suspensionCategory = category;
            
            // Set suspension end date if duration provided
            if (duration) {
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + duration);
                user.suspensionEnd = endDate;
            }

            await user.save();

            // Send email notification
            await sendSuspensionEmail(
                user.email,
                user.name,
                reason,
                category,
                user.suspensionEnd
            );

            res.json({
                message: 'User suspended successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: {
                        isActive: user.isActive,
                        suspendedAt: user.suspendedAt,
                        suspensionEnd: user.suspensionEnd,
                        suspensionCategory: user.suspensionCategory,
                        suspensionReason: user.suspensionReason
                    }
                }
            });
        } catch (error) {
            console.error('Error suspending user:', error);
            res.status(500).json({ 
                message: 'Error suspending user',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
);

// Reactivate user
router.post('/users/:id/reactivate',
    authenticateToken,
    isAdmin,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const user = await User.findById(req.params.id);
            
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            // Regular admins can't reactivate other admins
            if (user.role === 'admin' && req.user.role !== 'owner') {
                res.status(403).json({ message: 'Only owner can reactivate admin accounts' });
                return;
            }

            user.isActive = true;
            user.suspendedAt = undefined;
            user.suspendedBy = undefined;
            user.suspensionReason = undefined;

            await user.save();

            res.json({
                message: 'User reactivated successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isActive: user.isActive
                }
            });
        } catch (error) {
            console.error('Error reactivating user:', error);
            res.status(500).json({ 
                message: 'Error reactivating user',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
);

export { router as adminRouter };