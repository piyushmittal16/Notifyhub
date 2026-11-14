// Hamari custom Error class jo standard Error ko extend karti hai
export class AppError extends Error {
    constructor(message, statusCode, code = 'INTERNAL_ERROR') {
        super(message);

        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true; // Iska matlab ye hamara planned error hai, system crash nahi

        Error.captureStackTrace(this, this.constructor);
    }
}