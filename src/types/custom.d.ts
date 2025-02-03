import { Request } from 'express';
import { Document } from 'mongoose';
import { IUser } from '../models/User';

export interface AuthenticatedRequest extends Omit<Request, 'user'> {
    user: Document<unknown, {}, IUser> & Omit<IUser, '_id'> & {
        _id: any;
    };
} 