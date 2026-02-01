import { Router } from 'express';
import { insightsController } from '../controllers/insights.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/insights - Get AI-generated income insights
router.get('/', insightsController.getInsights.bind(insightsController));

// GET /api/insights/status - Check AI feature status
router.get('/status', insightsController.getStatus.bind(insightsController));

export default router;
