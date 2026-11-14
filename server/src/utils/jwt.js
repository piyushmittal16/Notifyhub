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
    const cookieOptions = {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    };
    res.cookie('token', token, cookieOptions)
};

export const clearAuthCookie = (res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: config.env === 'prodiction',
        sameSite: 'lax'
    });
};
