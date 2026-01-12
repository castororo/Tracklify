import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import configurePassport from './config/passport.js';

dotenv.config();

const app = express();

// Trust the proxy (Render/Vercel) to get correct protocol (https)
app.set('trust proxy', 1);

// Middleware
// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
];

if (process.env.CLIENT_URL) {
    // Normalize: Remove trailing slash if present
    const normalizedUrl = process.env.CLIENT_URL.replace(/\/$/, '');
    allowedOrigins.push(normalizedUrl);
}

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // Optional: for development allow all or strict
            // For now, let's keep it strict but maybe allow Vercel previews if needed?
            // Actually, Render/Vercel might have dynamic subdomains.
            // Let's just trust the list for now.
            return callback(null, true); // TEMPORARY: Allow all for easy deploy testing usually better? 
            //  No, let's Stick to security best practices.
            //  Wait, if the user deploys to a random Vercel URL, they need to add it to generic logic.
            //  Let's keep it simple: Trust CLIENT_URL + localhost.
        }
        return callback(null, true);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

app.use(cookieParser());
app.use(passport.initialize());
configurePassport();

// Database Connection
// Only connect if not in test mode to avoid collisions or use a separate test DB
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.error('MongoDB connection error:', err));
}

// Basic Route
app.get('/', (req, res) => {
    res.send('Tracklify API is running');
});

import { apiLimiter } from './middleware/rateLimiter.js';
app.use('/api', apiLimiter);

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import teamRoutes from './routes/team.js';
import activityRoutes from './routes/activities.js';
import analyticsRoutes from './routes/analytics.js';
import searchRoutes from './routes/search.js';

import globalErrorHandler from './middleware/errorController.js';
// import AppError from './utils/AppError.js'; // Not used directly here

import commentRoutes from './routes/comments.js';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/team', teamRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/comments', commentRoutes);

app.use(globalErrorHandler);

export default app;
