import { Response } from 'express';
import logger from './logger';

export const handleError = (res: Response, error: any, message: string = 'Internal server error') => {
    logger.error(`Error: ${message}`, { error });
    return res.status(500).json({
        success: false,
        message,
        error: error instanceof Error ? error.message : 'Unknown error'
    });
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const formatDate = (date: Date): string => {
    return date.toISOString();
};

export const generateRandomString = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}; 