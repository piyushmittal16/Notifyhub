import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";

export const protect = async (req, res, next) => {
    try {
        let token = null;
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token
        }
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('You are not logged in. Please log in to get access.', 401, 'UNAUTHORIZED'));
        }

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new AppError('Your session has expired. Please log in again.', 401, 'TOKEN_EXPIRED'));
            }
            return next(new AppError('Invalid authentication token.', 401, 'INVALID_TOKEN'));
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new AppError('The user belonging to this token no longer exists.', 401, 'USER_NOT_FOUND'));
        }

        if (user.status === 'blocked') {
            return next(new AppError('Your account has been blocked. Please contact support.', 403, 'ACCOUNT_BLOCKED'));
        }

        req.user = user;
        next();

    } catch (error) {
        next(error);
    }
}

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Agar user ka role allowed roles me nahi hai (e.g. developer trying to access admin route)
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action.', 403, 'FORBIDDEN'));
        }
        next();
    };
};