//--------------------------------
// Imports
//--------------------------------
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Route Imports
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { adminRouter } from './routes/admin.routes';

// Config Imports
import { connectDatabase } from './config/database';

//--------------------------------
// Configuration
//--------------------------------
dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3000;

//--------------------------------
// Middleware
//--------------------------------
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

//--------------------------------
// Route Registration
//--------------------------------
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);

//--------------------------------
// Server Startup
//--------------------------------
const startServer = async () => {
    try {
        await connectDatabase();
        app.listen(port, () => {
            console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();