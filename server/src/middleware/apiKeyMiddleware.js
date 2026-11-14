import { Project } from '../models/Project.js';
import { hashApiKey } from '../utils/apiKey.js';
import { AppError } from '../utils/appError.js';

export const validateApiKey = async (req, res, next) => {
    try {
        // 1. Header se API key padho
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            return next(new AppError('API key is required in x-api-key header.', 401, 'API_KEY_REQUIRED'));
        }

        // 2. Key ko hash karo aur database me project dhoondho
        const apiKeyHash = hashApiKey(apiKey);

        // .populate('userId') se hume project ke owner ka status bhi mil jayega
        const project = await Project.findOne({
            apiKeyHash,
            deletedAt: null
        }).populate('userId');

        if (!project) {
            return next(new AppError('Invalid API key.', 401, 'INVALID_API_KEY'));
        }

        // 3. Check karo kya project active hai?
        if (project.status !== 'active') {
            return next(new AppError('Project is inactive. Cannot send emails.', 403, 'PROJECT_INACTIVE'));
        }

        // 4. Check karo kya project ka owner blocked toh nahi hai?
        if (!project.userId || project.userId.status === 'blocked') {
            return next(new AppError('Project owner is blocked. Cannot send emails.', 403, 'ACCOUNT_BLOCKED'));
        }

        // 🎯 Project verified! Attach to req object
        req.project = project;
        next();
    } catch (error) {
        next(error);
    }
};