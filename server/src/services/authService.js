import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { signToken } from '../utils/jwt.js';

export const registerUser = async ({ name, email, password }) => {
    if (!name || !email || !password) {
        throw new AppError('Please provide name, email, and password.', 400, 'VALIDATION_ERROR');
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        throw new AppError('Email is already registered.', 409, 'EMAIL_ALREADY_EXISTS');
    }
    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: 'developer',
        status: 'active'
    });

    const token = signToken({ id: user._id, role: user.role });
    return {
        user: user.toSafeObject(),
        token
    };
};

export const loginUser = async ({ email, password }) => {
    if (!email || !password) {
        throw new AppError('Please provide name, email, and password.', 400, 'VALIDATION_ERROR');
    }
    const normalizedEmail = email.toLowerCase().trim();
    // ⚠️ Password par 'select: false' tha, isliye yaha zabardasti '+password' mangwana padega
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status === 'blocked') {
        throw new AppError('Your account has been blocked. Please contact support.', 403, 'ACCOUNT_BLOCKED');
    }
    const token = signToken({ id: user._id, role: user.role });
    return {
        user: user.toSafeObject(),
        token
    };
};


export const getCurrentUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }
    return user.toSafeObject();
};

export const updateProfile = async (userId, { name }) => {
    if (!name || !name.trim()) {
        throw new AppError('Name cannot be empty.', 400, 'VALIDATION_ERROR');
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }
    user.name = name.trim();
    await user.save();
    return user.toSafeObject();
};