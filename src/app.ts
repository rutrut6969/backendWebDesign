//--------------------------------
// Imports
//--------------------------------
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import session from 'express-session';

// Route Imports
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { adminRouter } from './routes/admin.routes';
import { passwordRouter } from './routes/password.routes';

// Config Imports
import { connectDatabase } from './config/database';

//--------------------------------
// Configuration
//--------------------------------
dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3000;
export default app; 
// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Replace with a strong secret
    resave: false, // Forces session to be saved back to the session store
    saveUninitialized: false, // Don't save uninitialized sessions
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 1000 * 60 * 60 * 24 // Set cookie expiration (e.g., 1 day)
    }
}));

// Rate limiting middleware for authentication routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later.',
});

//--------------------------------
// Middleware
//--------------------------------
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "same-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://trusted.cdn.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
    },
    noSniff: true,
    frameguard: { action: 'sameorigin' },
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/auth/login', authLimiter);

//--------------------------------
// Route Registration
//--------------------------------
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth/password', passwordRouter);

//--------------------------------
// Logout Route
//--------------------------------
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {

            return res.status(500).json({ message: 'Could not log out, please try again.' });
        }
        res.json({ message: 'Logout successful' });
    });
});

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

