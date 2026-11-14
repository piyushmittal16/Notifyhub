import * as analyticsService from '../services/analyticsService.js';

// 1. Project Overall Stats Summary
export const getProjectAnalyticsSummary = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const analytics = await analyticsService.getProjectAnalyticsSummary(req.user._id, projectId);

        return res.status(200).json({
            success: true,
            data: { analytics }
        });
    } catch (error) {
        next(error);
    }
};

// 2. Project Daily Trends (Graph Data)
export const getProjectDailyAnalytics = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { days } = req.query;
        const daily = await analyticsService.getProjectDailyAnalytics(req.user._id, projectId, days);

        return res.status(200).json({
            success: true,
            data: { daily }
        });
    } catch (error) {
        next(error);
    }
};