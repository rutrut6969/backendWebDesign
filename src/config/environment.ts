export const environment = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/codeweaver',
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    nodeEnv: process.env.NODE_ENV || 'development',
    emailUser: process.env.EMAIL_USER || '',
    emailPassword: process.env.EMAIL_PASSWORD || '',
}