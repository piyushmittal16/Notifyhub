import { Router } from 'express';
import * as emailController from '../controllers/emailController.js';
import { validateApiKey } from '../middleware/apiKeyMiddleware.js';
import { emailSendLimiter } from '../middleware/rateLimitMiddleware.js';
const router = Router();

router.post('/send', validateApiKey, emailSendLimiter, emailController.sendEmail);

export default router;