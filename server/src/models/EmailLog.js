import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Email log must belong to a project'],
            index: true
        },
        templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Template',
            default: null
        },
        templateName: {
            type: String,
            required: [true, 'Template name snapshot is required'],
            trim: true
        },
        to: {
            type: String,
            required: [true, 'Recipient email is required'],
            trim: true,
            lowercase: true
        },
        subject: {
            type: String,
            required: [true, 'Email subject is required']
        },
        status: {
            type: String,
            enum: {
                values: ['sent', 'failed'],
                message: 'Status must be sent or failed'
            },
            required: true
        },
        error: {
            type: String,
            default: null
        },
        sentAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// ⚡ Fast Logs Query: Project ke logs newest first (-1) dhoondhne ke liye
emailLogSchema.index({ projectId: 1, sentAt: -1 });

export const EmailLog = mongoose.model('EmailLog', emailLogSchema);