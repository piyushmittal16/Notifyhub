import { AppError } from '../utils/appError.js';
import { config } from '../config/env.js';

// 1. Mongoose Duplicate Key Error (jaise same email dobara aana: code 11000)
const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists.`;
    return new AppError(message, 409, 'DUPLICATE_RESOURCE');
};

// 2. Mongoose Validation Error (jaise email format galat hona ya password chota hona)
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Validation error: ${errors.join('. ')}`;
    return new AppError(message, 400, 'VALIDATION_ERROR');
};

// 3. JWT Invalid / Expired Errors
const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN');
const handleJWTExpiredError = () => new AppError('Your session has expired. Please log in again.', 401, 'TOKEN_EXPIRED');

// 🛡️ Main Error Handler Middleware (Notice 4 parameters: err, req, res, next)
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;
    error.code = err.code || 'INTERNAL_ERROR';

    // Specific errors ko clean AppError me convert karo
    if (err.code === 11000) error = handleDuplicateKeyError(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // Client ko clean JSON response bhejo
    const response = {
        success: false,
        message: error.message || 'An unexpected error occurred.',
        code: error.code || 'INTERNAL_ERROR'
    };

    // Agar development mode hai aur unexpected crash hua, toh stack trace dikhao (debugging ke liye)
    if (config.env === 'development' && !error.isOperational) {
        response.stack = err.stack;
    }

    res.status(error.statusCode).json(response);
};