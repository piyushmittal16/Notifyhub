import { EmailLog } from '../models/EmailLog.js';
import * as projectService from './projectService.js';
import mongoose from 'mongoose';

// 1. Project ka Overall Analytics Summary nikalna
export const getProjectAnalyticsSummary = async (userId, projectId) => {
    // A. Verify karo ki project is user ka hi hai
    await projectService.getProjectById(userId, projectId);

    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    // B. MongoDB Aggregation se counts nikalo
    const stats = await EmailLog.aggregate([
        { $match: { projectId: projectObjectId } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    let sent = 0;
    let failed = 0;

    stats.forEach((item) => {
        if (item._id === 'sent') sent = item.count;
        if (item._id === 'failed') failed = item.count;
    });

    const total = sent + failed;
    const successRate = total > 0 ? parseFloat(((sent / total) * 100).toFixed(2)) : 0;

    return {
        total,
        sent,
        failed,
        successRate: `${successRate}%`
    };
};

// 2. Daily Trends nikalna (Pichle 7 ya 30 din ka data Graph ke liye)
export const getProjectDailyAnalytics = async (userId, projectId, days = 7) => {
    await projectService.getProjectById(userId, projectId);

    const projectObjectId = new mongoose.Types.ObjectId(projectId);
    const daysNum = Math.min(30, Math.max(1, parseInt(days, 10) || 7));

    // Date range calculate karo (Aaj se pichle X din)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    startDate.setHours(0, 0, 0, 0);

    const dailyStats = await EmailLog.aggregate([
        {
            $match: {
                projectId: projectObjectId,
                sentAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$sentAt' } },
                    status: '$status'
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.date': 1 } }
    ]);

    return dailyStats;
};