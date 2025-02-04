import 'express-session';

declare module 'express-session' {
    interface SessionData {
        userId: string; // Add any other session properties you need
    }
}
