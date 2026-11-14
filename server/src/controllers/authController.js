import * as authService from '../services/authService.js';
import { setAuthCookie, clearAuthCookie } from '../utils/jwt.js';

export const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const { user, token } = await authService.registerUser({ name, email, password });
        setAuthCookie(res, token);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.loginUser({ email, password });
        setAuthCookie(res, token);

        return res.status(201).json({
            success: true,
            message: "User login successfully",
            data: { user }
        })
    } catch (error) {
        next(error);
    }
}

export const logout = async (req, res, next) => {
    try {
        clearAuthCookie(res);
        return res.status(200).json({
            success: true,
            message: "User logout successfully"
        })
    } catch (error) {
        next(error);
    }
}

export const getMe = async (req, res, next) => {
    try {
        // req.user hume Auth Middleware se milega (jo hum abhi banayenge)
        const user = await authService.getCurrentUser(req.user._id);
        return res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const user = await authService.updateProfile(req.user._id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};