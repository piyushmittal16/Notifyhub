import * as emailService from '../services/emailService.js';
import * as projectService from '../services/projectService.js';

// Send Email Controller (External API with x-api-key)
export const sendEmail = async (req, res, next) => {
    try {
        const { templateId, to, variables } = req.body;

        const result = await emailService.sendTransactionalEmail({
            project: req.project,
            templateId,
            to,
            variables
        });

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// 💡 In-App Test Send Controller (Dashboard se session JWT ke zariye)
export const testSendEmail = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { templateId, to, variables } = req.body;

        // Verify project ownership
        const project = await projectService.getProjectById(req.user._id, projectId);

        const result = await emailService.sendTransactionalEmail({
            project,
            templateId,
            to,
            variables
        });

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};