import * as projectService from '../services/projectService.js';

// 1. Create Project
export const createProject = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const { project, apiKey } = await projectService.createProject({
            userId: req.user._id,
            name,
            description
        });

        return res.status(201).json({
            success: true,
            message: 'Project created successfully. Please copy your API key, it will not be shown again!',
            data: { project, apiKey }
        });
    } catch (error) {
        next(error);
    }
};

// 2. Get All Projects
export const getProjects = async (req, res, next) => {
    try {
        const projects = await projectService.getProjects(req.user._id);

        return res.status(200).json({
            success: true,
            data: { projects }
        });
    } catch (error) {
        next(error);
    }
};

// 3. Get Single Project
export const getProjectById = async (req, res, next) => {
    try {
        const project = await projectService.getProjectById(req.user._id, req.params.id);

        return res.status(200).json({
            success: true,
            data: { project }
        });
    } catch (error) {
        next(error);
    }
};

// 4. Update Project Details
export const updateProject = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const project = await projectService.updateProject(req.user._id, req.params.id, { name, description });

        return res.status(200).json({
            success: true,
            message: 'Project updated successfully.',
            data: { project }
        });
    } catch (error) {
        next(error);
    }
};

// 5. Update Status ('active' / 'inactive')
export const updateProjectStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const project = await projectService.updateProjectStatus(req.user._id, req.params.id, status);

        return res.status(200).json({
            success: true,
            message: `Project status updated to ${status}.`,
            data: { project }
        });
    } catch (error) {
        next(error);
    }
};

// 6. Delete Project (Soft Delete)
export const deleteProject = async (req, res, next) => {
    try {
        await projectService.deleteProject(req.user._id, req.params.id);

        return res.status(200).json({
            success: true,
            message: 'Project deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};

// 7. Regenerate API Key
export const regenerateApiKey = async (req, res, next) => {
    try {
        const { project, apiKey } = await projectService.regenerateApiKey(req.user._id, req.params.id);

        return res.status(200).json({
            success: true,
            message: 'API key regenerated successfully. Previous key has been invalidated!',
            data: { project, apiKey }
        });
    } catch (error) {
        next(error);
    }
};