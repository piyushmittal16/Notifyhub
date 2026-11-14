import { Router } from 'express';
import * as templateController from '../controllers/templateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Saare routes protected hain
router.use(protect);

// Direct Template endpoints (/api/v1/templates/:id)
router.get('/:id', templateController.getTemplateById);
router.patch('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);
router.patch('/:id/status', templateController.updateTemplateStatus);

export default router;