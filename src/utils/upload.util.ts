import multer from 'multer';
import path from 'path';

// Configure Storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/profiles')
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File Filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    // Check if file is an image
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Not an Image! Please upload an image.'));
    }
};

// Create upload middleware
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5Mb Limit
    },
    fileFilter: fileFilter
});