import { Template } from '../models/Template.js';
import * as projectService from './projectService.js';
import { AppError } from '../utils/appError.js';


export const createTemplate = async ({ userId, projectId, name, subject, html, status }) => {
    await projectService.getProjectById(userId, projectId);

    if (!name || !subject || !html) {
        throw new AppError('Name, subject, and HTML content are required.', 400, 'VALIDATION_ERROR');
    }

    const template = await Template.create({
        projectId,
        name: name.trim(),
        subject: subject.trim(),
        html,
        status: status || 'draft'
    });

    return template;
};




export const getTemplatesByProject = async (userId, projectId) => {

    await projectService.getProjectById(userId, projectId);

    return Template.find({ projectId, deletedAt: null }).sort({ createdAt: -1 });
};



// 3. Single Template nikalna (Ownership verification ke sath)
export const getTemplateById = async (userId, templateId) => {
    const template = await Template.findOne({ _id: templateId, deletedAt: null });

    if (!template) {
        throw new AppError('Template not found.', 404, 'TEMPLATE_NOT_FOUND');
    }

    // Verify karo ki is template ka project sach me is logged-in user ka hai!
    await projectService.getProjectById(userId, template.projectId);

    return template;
};

// 4. Template Update karna (Name, Subject, HTML)
export const updateTemplate = async (userId, templateId, { name, subject, html }) => {
    const template = await getTemplateById(userId, templateId);

    if (name !== undefined) template.name = name.trim();
    if (subject !== undefined) template.subject = subject.trim();
    if (html !== undefined) template.html = html;

    await template.save();
    return template;
};

// 5. Template ka Status badalna ('draft', 'active', 'archived')
export const updateTemplateStatus = async (userId, templateId, status) => {
    if (!['draft', 'active', 'archived'].includes(status)) {
        throw new AppError('Status must be draft, active, or archived.', 400, 'INVALID_STATUS');
    }

    const template = await getTemplateById(userId, templateId);
    template.status = status;
    await template.save();

    return template;
};

// 6. Template ko Soft Delete karna
export const deleteTemplate = async (userId, templateId) => {
    const template = await getTemplateById(userId, templateId);

    template.deletedAt = new Date();
    await template.save();

    return template;
};