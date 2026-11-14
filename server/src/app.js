import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan'; // 👈 Import Morgan
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { AppError } from './utils/appError.js';
import { apiLimiter } from './middleware/rateLimitMiddleware.js';
import { config } from './config/env.js';
import { mongoSanitize } from './middleware/sanitizeMiddleware.js';

const app = express();

// 1. Dynamic CORS
const allowedOrigins = [config.clientOrigin, 'http://localhost:5173'].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new AppError('Blocked by CORS policy', 403, 'CORS_ERROR'));
        }
    },
    credentials: true
}));

// 2. HTTP Request Logger (Observability)
if (config.env === 'development') {
    app.use(morgan('dev')); // 👈 Terminal me colored real-time request logs aayenge
} else {
    app.use(morgan('combined')); // Production format
}

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize);

// 3. Global Rate Limiter & Mount API Routes
app.use('/api/v1', apiLimiter, routes);

// 4. 404 Handler
app.use((req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404, 'ROUTE_NOT_FOUND'));
});

// 5. Global Error Handler
app.use(errorHandler);

export default app;