import { EmailLog } from '../models/EmailLog.js';
import { Project } from '../models/Project.js';
import { AppError } from '../utils/appError.js';

// 1. Logs Fetch karna (Filters + Pagination + Tenant Isolation)
export const getLogs = async ({
    userId,
    projectId,
    status,
    to,
    startDate,
    endDate,
    page = 1,
    limit = 20
}) => {

    const userProjects = await Project.find({ userId, deletedAt: null }).select('_id');
    const userProjectIds = userProjects.map((p) => p._id.toString());


    if (userProjectIds.length === 0) {
        return { logs: [], pagination: { total: 0, page: 1, limit, totalPages: 0 } };
    }


    const query = {};

    if (projectId) {
        if (!userProjectIds.includes(projectId.toString())) {
            throw new AppError('Project not found or you do not have access.', 404, 'PROJECT_NOT_FOUND');
        }
        query.projectId = projectId;
    } else {

        query.projectId = { $in: userProjectIds };
    }

    if (status) {
        query.status = status;
    }

    if (to) {
        // Case-insensitive search on recipient email
        query.to = { $regex: to.trim(), $options: 'i' };
    }

    if (startDate || endDate) {
        query.sentAt = {};
        if (startDate) query.sentAt.$gte = new Date(startDate);
        if (endDate) query.sentAt.$lte = new Date(endDate);
    }

    // D. Pagination Calculation
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20)); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;

    // E. Database se logs fetch karo aur total count nikalo
    const [logs, total] = await Promise.all([
        EmailLog.find(query)
            .sort({ sentAt: -1 }) // Newest first
            .skip(skip)
            .limit(limitNum),
        EmailLog.countDocuments(query)
    ]);

    return {
        logs,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        }
    };
};

// 2. Single Log nikalna (Ownership check ke sath)
export const getLogById = async (userId, logId) => {
    const log = await EmailLog.findById(logId);

    if (!log) {
        throw new AppError('Log not found.', 404, 'LOG_NOT_FOUND');
    }

    // Verify karo ki ye log jis project ka hai, wo project is user ka hai ya nahi!
    const project = await Project.findOne({
        _id: log.projectId,
        userId,
        deletedAt: null
    });

    if (!project) {
        throw new AppError('You do not have access to this log.', 403, 'FORBIDDEN');
    }

    return log;
};