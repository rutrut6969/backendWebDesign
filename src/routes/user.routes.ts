import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { upload } from '../utils/upload.util';
import fs from 'fs';
import path from 'path';
import { MulterError } from 'multer';
import { Request, Response } from 'express';

const router: Router = Router();

// Protected Route Example
router.get('/profile', authenticateToken, (req, res) => {
    res.json({
        message: 'Protected route accessed successfully',
        user: {
            id: req.user._id,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role
        }
    });
});

// Error handling middleware for multer
const handleUpload = (req: any, res: any, next: any) => {
    const uploadMiddleware = upload.single('profileImage');
    
    uploadMiddleware(req, res, (err: any) => {
        if (err) {
            if (err instanceof MulterError) {
                // Multer-specific errors
                switch (err.code) {
                    case 'LIMIT_FILE_SIZE':
                        return res.status(400).json({ 
                            message: 'File too large. Maximum size is 5MB' 
                        });
                    case 'LIMIT_UNEXPECTED_FILE':
                        return res.status(400).json({ 
                            message: 'Wrong field name for file upload' 
                        });
                    default:
                        return res.status(400).json({ 
                            message: 'Error uploading file', 
                            error: err.code 
                        });
                }
            } else {
                // Non-Multer errors
                return res.status(400).json({ 
                    message: err.message || 'Error uploading file' 
                });
            }
        }
        next();
    });
};

router.put('/profile', 
    authenticateToken,
    handleUpload,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, phoneNumber, address, bio } = req.body;
            
            // Handle profile image update
            if (req.file) {
                try {
                    // Delete old profile image if it exists
                    if (req.user.profileImage) {
                        const oldImagePath = path.join(
                            __dirname, 
                            '../../uploads/profiles', 
                            path.basename(req.user.profileImage)
                        );
                        
                        if (fs.existsSync(oldImagePath)) {
                            fs.unlinkSync(oldImagePath);
                        }
                    }

                    req.user.profileImage = `/uploads/profiles/${req.file.filename}`;
                } catch (error) {
                    console.error('Error handling profile image:', error);
                    res.status(500).json({ 
                        message: 'Error processing profile image' 
                    });
                    return;
                }
            }

            // Update other fields
            req.user.name = name || req.user.name;
            req.user.phoneNumber = phoneNumber || req.user.phoneNumber;
            req.user.address = address || req.user.address;
            req.user.bio = bio || req.user.bio;

            await req.user.save();

            res.json({
                message: 'Profile updated successfully',
                user: {
                    id: req.user._id,
                    email: req.user.email,
                    name: req.user.name,
                    role: req.user.role,
                    phoneNumber: req.user.phoneNumber,
                    address: req.user.address,
                    bio: req.user.bio,
                    profileImage: req.user.profileImage
                }
            });
        } catch (error) {
            console.error('Profile update error:', error);
            res.status(500).json({ 
                message: 'Error updating profile',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
);

export { router as userRouter };
