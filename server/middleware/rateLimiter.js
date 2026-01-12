import rateLimit from 'express-rate-limit';

// Global API Limiter: 100 requests per 15 minutes
// Good for general API endpoints to prevent simple DoS
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Auth Limiter: 5 requests per hour (strictly for login/register/forgot-password)
// Prevents brute-force attacks on passwords
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 login requests per hour
    message: {
        message: 'Too many login attempts from this IP, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
