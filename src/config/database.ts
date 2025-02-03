import mongoose from 'mongoose';
import {environment } from './environment';


export const connectDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(environment.mongoUri);
        console.log('Connected to MongoDB Successfully');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
}