import { Template } from '../models/Template.js';
import { EmailLog } from '../models/EmailLog.js';
import { sendEmail } from '../config/email.js';
import { renderTemplate } from '../utils/templateEngine.js';
import { AppError } from '../utils/appError.js';

// Valid email regex
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export const sendTransactionalEmail = async ({ project, templateId, to, variables = {} }) => {
    // 1. Recipient check
    if (!to || typeof to !== 'string' || !EMAIL_REGEX.test(to.trim()) || to.includes(',')) {
        throw new AppError('A single valid recipient email is required in the "to" field.', 400, 'INVALID_RECIPIENT');
    }

    const recipient = to.trim().toLowerCase();

    // 2. Template dhoondho (Verify karo ki ye template ISI project ka hai!)
    const template = await Template.findOne({
        _id: templateId,
        projectId: project._id,
        deletedAt: null
    });

    if (!template) {
        throw new AppError('Template not found in this project.', 404, 'TEMPLATE_NOT_FOUND');
    }

    // 3. Template status check karo
    if (template.status !== 'active') {
        throw new AppError(`Template is not active. Current status: ${template.status}`, 400, 'TEMPLATE_NOT_ACTIVE');
    }

    // 4. Variables replace karo (Subject aur HTML me)
    const renderedSubject = renderTemplate(template.subject, variables);
    const renderedHtml = renderTemplate(template.html, variables);

    let emailLog;

    // 5. Email send karo aur Log maintain karo
    try {
        const info = await sendEmail({
            to: recipient,
            subject: renderedSubject,
            html: renderedHtml
        });

        // 🟢 Success Log
        emailLog = await EmailLog.create({
            projectId: project._id,
            templateId: template._id,
            templateName: template.name,
            to: recipient,
            subject: renderedSubject,
            status: 'sent',
            sentAt: new Date()
        });

        return {
            success: true,
            message: 'Email delivered successfully.',
            data: {
                logId: emailLog._id,
                messageId: info.messageId
            }
        };
    } catch (error) {
        // 🔴 Failed Log (Database me record save karo taaki developer dashboard me dekh sake)
        const safeError = error.message ? error.message.slice(0, 300) : 'Email transport failed';

        emailLog = await EmailLog.create({
            projectId: project._id,
            templateId: template._id,
            templateName: template.name,
            to: recipient,
            subject: renderedSubject,
            status: 'failed',
            error: safeError,
            sentAt: new Date()
        });

        throw new AppError(`Email delivery failed: ${safeError}`, 500, 'EMAIL_SEND_FAILED');
    }
};