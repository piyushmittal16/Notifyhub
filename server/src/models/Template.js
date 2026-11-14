import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Template must belong to a project'],
            index: true
        },
        name: {
            type: String,
            required: [true, 'Template name is required'],
            trim: true,
            maxlength: [100, 'Template name cannot exceed 100 characters']
        },
        subject: {
            type: String,
            required: [true, 'Email subject is required'],
            trim: true,
            maxlength: [200, 'Subject cannot exceed 200 characters']
        },
        html: {
            type: String,
            required: [true, 'HTML content is required']
        },
        status: {
            type: String,
            enum: {
                values: ['draft', 'active', 'archived'],
                message: 'Status must be draft, active, or archived'
            },
            default: 'draft'
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// 🔒 Unique Name per Project (Partial index: Sirf non-deleted templates par enforce hoga)
templateSchema.index(
    { projectId: 1, name: 1 },
    { unique: true, partialFilterExpression: { deletedAt: null } }
);

export const Template = mongoose.model('Template', templateSchema);