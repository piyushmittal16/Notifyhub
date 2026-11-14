import { Project } from '../models/Project.js';
import { AppError } from '../utils/appError.js';
import { generateApiKey, hashApiKey } from '../utils/apiKey.js';

// 1. Naya Project Create karna
export const createProject = async ({ userId, name, description }) => {
    if (!name) {
        throw new AppError('Project name is required.', 400, 'VALIDATION_ERROR');
    }

    const rawApiKey = generateApiKey();

    const apiKeyHash = hashApiKey(rawApiKey);

    const project = await Project.create({
        userId,
        name: name.trim(),
        description: description ? description.trim() : '',
        apiKeyHash,
        status: 'active'
    });

    return {
        project: project.toSafeObject(),
        apiKey: rawApiKey
    };
};


export const getProjects = async (userId) => {
    return Project.find({ userId, deletedAt: null }).sort({ createdAt: -1 });
};


export const getProjectById = async (userId, projectId) => {
    const project = await Project.findOne({
        _id: projectId,
        userId,
        deletedAt: null
    });

    if (!project) {
        throw new AppError('Project not found or you do not have access.', 404, 'PROJECT_NOT_FOUND');
    }

    return project;
};


export const updateProject = async (userId, projectId, { name, description }) => {
    const project = await getProjectById(userId, projectId);

    if (name !== undefined) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();

    await project.save();
    return project;
};


export const updateProjectStatus = async (userId, projectId, status) => {
    if (!['active', 'inactive'].includes(status)) {
        throw new AppError('Status must be either active or inactive.', 400, 'INVALID_STATUS');
    }

    const project = await getProjectById(userId, projectId);
    project.status = status;
    await project.save();

    return project;
};


export const deleteProject = async (userId, projectId) => {
    const project = await getProjectById(userId, projectId);

    // Hard delete nahi karenge! Bas timestamp lagayenge
    project.deletedAt = new Date();
    await project.save();

    return project;
};


export const regenerateApiKey = async (userId, projectId) => {
    const project = await getProjectById(userId, projectId);

    const newRawApiKey = generateApiKey();
    project.apiKeyHash = hashApiKey(newRawApiKey);
    await project.save();

    return {
        project: project.toSafeObject(),
        apiKey: newRawApiKey
    };
};