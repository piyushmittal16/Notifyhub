import * as adminService from '../services/adminService.js';

// 1. Saare users ko fetch karna (Admin only)
export const getUsers = async (req, res, next) => {
    try {
        const { search, role, status, page, limit } = req.query;

        const result = await adminService.getUsers({
            search,
            role,
            status,
            page,
            limit
        });

        return res.status(200).json({
            success: true,
            data: result.users,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

// 2. User ka status change karna (Block ya Unblock)
export const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const user = await adminService.updateUserStatus(req.user._id, id, status);

        return res.status(200).json({
            success: true,
            message: `User status updated to ${status} successfully.`,
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

// 3. Platform ke saare projects dekhna (Overview)
export const getProjects = async (req, res, next) => {
    try {
        const { search, status, page, limit } = req.query;

        const result = await adminService.getProjects({
            search,
            status,
            page,
            limit
        });

        return res.status(200).json({
            success: true,
            data: result.projects,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

// 4. Pure platform ka aggregate analytics nikalna
export const getPlatformAnalytics = async (req, res, next) => {
    try {
        const analytics = await adminService.getPlatformAnalytics();

        return res.status(200).json({
            success: true,
            data: { analytics }
        });
    } catch (error) {
        next(error);
    }
};