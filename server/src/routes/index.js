import { Router } from 'express';
import authRoutes from './authRoutes.js';
import projectRoutes from './projectRoutes.js';
import templateRoutes from './templateRoutes.js';
import emailRoutes from './emailRoutes.js';
import logRoutes from './logRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'NotifyHub API is healthy and running!'
    });
});

// Mount All API Routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/templates', templateRoutes);
router.use('/emails', emailRoutes);
router.use('/logs', logRoutes);
router.use('/admin', adminRoutes);

export default router;