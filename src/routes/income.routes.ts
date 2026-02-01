import { Router } from 'express';
import { incomeController } from '../controllers/income.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  sensitiveRateLimiter,
  validateUuidParam,
} from '../middleware/security.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Income sources
router.get('/sources', incomeController.getSources.bind(incomeController));

// Analytics
router.get('/summary', incomeController.getSummary.bind(incomeController));

// Income records CRUD
router.get('/', incomeController.getRecords.bind(incomeController));

// Single record operations with UUID validation
router.get(
  '/:id',
  validateUuidParam('id'),
  incomeController.getRecord.bind(incomeController)
);

router.post('/', incomeController.createRecord.bind(incomeController));

router.put(
  '/:id',
  validateUuidParam('id'),
  incomeController.updateRecord.bind(incomeController)
);

// Delete is a sensitive operation - apply stricter rate limiting
router.delete(
  '/:id',
  sensitiveRateLimiter,
  validateUuidParam('id'),
  incomeController.deleteRecord.bind(incomeController)
);

export default router;
