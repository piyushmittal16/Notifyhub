import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Project must belong to a user'],
            index: true
        },
        name: {
            type: String,
            required: [true, 'Project name is required'],
            trim: true,
            maxlength: [100, 'Project name cannot exceed 100 characters']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
            default: ''
        },
        status: {
            type: String,
            enum: {
                values: ['active', 'inactive'],
                message: 'Status must be either active or inactive'
            },
            default: 'active'
        },
        apiKeyHash: {
            type: String,
            required: [true, 'API Key hash is required'],
            select: false // Hash ko kisi bhi query me by default mat bhejo (Security)
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

// ⚡ Fast Queries ke liye Compound Index
// Developer ke non-deleted projects dhoondhne ke liye:
projectSchema.index({ userId: 1, deletedAt: 1 });

// 🛡️ Safe Object: apiKeyHash aur __v ko response se delete karne ke liye
projectSchema.methods.toSafeObject = function () {
    const project = this.toObject();
    delete project.apiKeyHash;
    delete project.__v;
    return project;
};

export const Project = mongoose.model('Project', projectSchema);