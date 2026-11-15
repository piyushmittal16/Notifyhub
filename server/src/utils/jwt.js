import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const signToken = (payload) => {
    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: '7d'
    });
};

export const verifyToken = (token) => {
    return jwt.verify(token, config.jwtSecret);
};

export const setAuthCookie = (res, token) => {
    const isProduction = config.env === 'production';
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    };
    res.cookie('token', token, cookieOptions);
};

export const clearAuthCookie = (res) => {
    const isProduction = config.env === 'production';
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    });
};
