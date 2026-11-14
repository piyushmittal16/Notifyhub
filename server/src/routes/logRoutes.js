import { Router } from 'express';
import * as logController from '../controllers/logController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Saare routes login protected hain
router.use(protect);

// /api/v1/logs
router.get('/', logController.getLogs); // All Logs
router.get('/:id', logController.getLogById); // Single Log

export default router;