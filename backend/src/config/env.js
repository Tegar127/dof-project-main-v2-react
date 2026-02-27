import dotenv from 'dotenv';
dotenv.config();

export default {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'secret',
    dbClient: process.env.DB_CLIENT || 'better-sqlite3',
    dbFilename: process.env.DB_FILENAME || './database/database.sqlite',
    frontendUrls: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173', 'http://localhost:5174']
};
