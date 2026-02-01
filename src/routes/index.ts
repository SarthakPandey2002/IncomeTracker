import { Router } from 'express';
import incomeRoutes from './income.routes';
import csvRoutes from './csv.routes';
import waitlistRoutes from './waitlist.routes';
import insightsRoutes from './insights.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/income', incomeRoutes);
router.use('/csv', csvRoutes);
router.use('/waitlist', waitlistRoutes);
router.use('/insights', insightsRoutes);

export default router;
