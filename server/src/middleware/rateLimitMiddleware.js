import rateLimit from 'express-rate-limit';

// 1. 🔒 Auth Rate Limiter (Brute-Force Protection for Login & Signup)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Max 10 attempts per IP
    standardHeaders: true, // Return standard RateLimit-* headers
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many attempts from this IP. Please try again after 15 minutes.',
        code: 'TOO_MANY_REQUESTS'
    }
});

// 2. 💌 Email Send Limiter (Prevent SMTP Flooding & Spiking Bills)
export const emailSendLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Max 60 emails per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Email rate limit exceeded (maximum 60 requests per minute). Please slow down.',
        code: 'RATE_LIMIT_EXCEEDED'
    }
});

// 3. 🌐 Global API Limiter (General DDoS Protection)
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Max 500 requests per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP. Please try again later.',
        code: 'TOO_MANY_REQUESTS'
    }
});