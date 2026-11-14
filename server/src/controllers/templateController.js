import * as templateService from '../services/templateService.js';

// 1. Create Template inside a Project
export const createTemplate = async (req, res, next) => {
    try {
        const { name, subject, html, status } = req.body;
        const { projectId } = req.params; // /projects/:projectId/templates

        const template = await templateService.createTemplate({
            userId: req.user._id,
            projectId,
            name,
            subject,
            html,
            status
        });

        return res.status(201).json({
            success: true,
            message: 'Template created successfully.',
            data: { template }
        });
    } catch (error) {
        next(error);
    }
};

// 2. Get All Templates of a Project
export const getTemplatesByProject = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const templates = await templateService.getTemplatesByProject(req.user._id, projectId);

        return res.status(200).json({
            success: true,
            data: { templates }
        });
    } catch (error) {
        next(error);
    }
};

// 3. Get Single Template by ID
export const getTemplateById = async (req, res, next) => {
    try {
        const template = await templateService.getTemplateById(req.user._id, req.params.id);

        return res.status(200).json({
            success: true,
            data: { template }
        });
    } catch (error) {
        next(error);
    }
};

// 4. Update Template
export const updateTemplate = async (req, res, next) => {
    try {
        const { name, subject, html } = req.body;
        const template = await templateService.updateTemplate(req.user._id, req.params.id, {
            name,
            subject,
            html
        });

        return res.status(200).json({
            success: true,
            message: 'Template updated successfully.',
            data: { template }
        });
    } catch (error) {
        next(error);
    }
};

// 5. Update Status ('draft' / 'active' / 'archived')
export const updateTemplateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const template = await templateService.updateTemplateStatus(req.user._id, req.params.id, status);

        return res.status(200).json({
            success: true,
            message: `Template status updated to ${status}.`,
            data: { template }
        });
    } catch (error) {
        next(error);
    }
};

// 6. Delete Template (Soft Delete)
export const deleteTemplate = async (req, res, next) => {
    try {
        await templateService.deleteTemplate(req.user._id, req.params.id);

        return res.status(200).json({
            success: true,
            message: 'Template deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};