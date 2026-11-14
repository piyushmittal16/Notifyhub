import * as logService from '../services/logService.js';

// 1. Get Logs (All Logs ya Project-specific Logs with filters & pagination)
export const getLogs = async (req, res, next) => {
    try {
        const { status, to, startDate, endDate, page, limit } = req.query;
        // URL param (:projectId) ya Query param (?projectId=...) dono support karo
        const projectId = req.params.projectId || req.query.projectId;

        const result = await logService.getLogs({
            userId: req.user._id,
            projectId,
            status,
            to,
            startDate,
            endDate,
            page,
            limit
        });

        return res.status(200).json({
            success: true,
            data: result.logs,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

// 2. Get Single Log by ID
export const getLogById = async (req, res, next) => {
    try {
        const log = await logService.getLogById(req.user._id, req.params.id);

        return res.status(200).json({
            success: true,
            data: { log }
        });
    } catch (error) {
        next(error);
    }
};