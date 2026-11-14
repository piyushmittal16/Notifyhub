import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { EmailLog } from '../models/EmailLog.js';
import { AppError } from '../utils/appError.js';


export const getUsers = async ({ search, role, status, page = 1, limit = 20 }) => {
    const query = {};


    if (search) {
        query.$or = [
            { name: { $regex: search.trim(), $options: 'i' } },
            { email: { $regex: search.trim(), $options: 'i' } }
        ];
    }


    if (role) {
        query.role = role;
    }

    if (status) {
        query.status = status;
    }

    // Pagination math
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
        User.find(query)
            .select('-password -__v')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        User.countDocuments(query)
    ]);

    return {
        users,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        }
    };
};


export const updateUserStatus = async (adminUserId, targetUserId, newStatus) => {
    // A. Validate status value
    if (!['active', 'blocked'].includes(newStatus)) {
        throw new AppError('Status must be either active or blocked.', 400, 'INVALID_STATUS');
    }

    // B. Self-lockout check: Admin apne aap ko block nahi kar sakta
    if (adminUserId.toString() === targetUserId.toString()) {
        throw new AppError('Admins cannot change their own account status.', 400, 'SELF_STATUS_CHANGE_NOT_ALLOWED');
    }

    // C. User find karo
    const user = await User.findById(targetUserId);
    if (!user) {
        throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    // D. Update aur save
    user.status = newStatus;
    await user.save();

    return user.toSafeObject();
};


export const getProjects = async ({ search, status, page = 1, limit = 20 }) => {
    const query = { deletedAt: null };

    if (search) {
        query.name = { $regex: search.trim(), $options: 'i' };
    }

    if (status) {
        query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // .select('-apiKeyHash') ensure karta hai ki secret keys kabhi admin ko bhi na dikhein
    const [projects, total] = await Promise.all([
        Project.find(query)
            .populate('userId', 'name email status role')
            .select('-apiKeyHash -__v')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        Project.countDocuments(query)
    ]);

    return {
        projects,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum)
        }
    };
};


export const getPlatformAnalytics = async () => {
    const [userStats, projectStats, emailStats] = await Promise.all([
        // Users stats
        User.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    activeUsers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                    blockedUsers: { $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] } },
                    developers: { $sum: { $cond: [{ $eq: ['$role', 'developer'] }, 1, 0] } },
                    admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } }
                }
            }
        ]),
        // Projects stats (active vs inactive non-deleted)
        Project.aggregate([
            { $match: { deletedAt: null } },
            {
                $group: {
                    _id: null,
                    totalProjects: { $sum: 1 },
                    activeProjects: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                    inactiveProjects: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } }
                }
            }
        ]),
        // Platform email stats (sent vs failed)
        EmailLog.aggregate([
            {
                $group: {
                    _id: null,
                    totalEmails: { $sum: 1 },
                    sentEmails: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
                    failedEmails: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
                }
            }
        ])
    ]);

    const users = userStats[0] || { totalUsers: 0, activeUsers: 0, blockedUsers: 0, developers: 0, admins: 0 };
    delete users._id;

    const projects = projectStats[0] || { totalProjects: 0, activeProjects: 0, inactiveProjects: 0 };
    delete projects._id;

    const emails = emailStats[0] || { totalEmails: 0, sentEmails: 0, failedEmails: 0 };
    delete emails._id;

    const successRate = emails.totalEmails > 0
        ? parseFloat(((emails.sentEmails / emails.totalEmails) * 100).toFixed(2))
        : 0;

    return {
        users,
        projects,
        emails: {
            ...emails,
            successRate: `${successRate}%`
        }
    };
};
