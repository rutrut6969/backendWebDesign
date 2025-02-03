import fs from 'fs';
import path from 'path';

export const createUploadDirectories = () => {
    const uploadDir = path.join(__dirname, '../../uploads');
    const profilesDir = path.join(uploadDir, 'profiles');

    // Create directories if they don't exist
    if(!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }
    if(!fs.existsSync(profilesDir)) {
        fs.mkdirSync(profilesDir);
    }
};