import jwt from 'jsonwebtoken';
import { environment } from '../config/environment';
import { IUser } from '../models/User';

export const generateToken = (user: IUser): string => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        environment.jwtSecret,
        {
            expiresIn: '24h'
        }
    );
};
