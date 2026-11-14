import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// 🛡️ Security: Sirf logged-in users jinka role 'admin' ho wahi in routes ko access kar sakte hain
router.use(protect);
router.use(authorizeRoles('admin'));

// 1. Users Management
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);

// 2. Projects Overview
router.get('/projects', adminController.getProjects);

// 3. Platform Aggregate Analytics
router.get('/analytics', adminController.getPlatformAnalytics);

export default router;