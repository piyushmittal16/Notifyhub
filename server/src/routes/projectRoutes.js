import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import * as templateController from '../controllers/templateController.js';
import * as logController from '../controllers/logController.js';
import * as analyticsController from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import * as emailController from '../controllers/emailController.js';
import { emailSendLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

router.use(protect);

// Projects CRUD
router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.patch('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Special actions
router.patch('/:id/status', projectController.updateProjectStatus);
router.post('/:id/api-key', projectController.regenerateApiKey);

// Templates under a project
router.post('/:projectId/templates', templateController.createTemplate);
router.get('/:projectId/templates', templateController.getTemplatesByProject);

// 📊 Project Logs & Analytics
router.get('/:projectId/logs', logController.getLogs);
router.get('/:projectId/analytics', analyticsController.getProjectAnalyticsSummary);
router.get('/:projectId/analytics/daily', analyticsController.getProjectDailyAnalytics);

// ✉️ In-App Test Send Email
router.post('/:projectId/emails/test-send', emailSendLimiter, emailController.testSendEmail);
export default router;