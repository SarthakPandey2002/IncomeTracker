import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { incomeService } from '../services/income.service';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../middleware/error.middleware';

// Validation schemas
const createRecordSchema = z.object({
  source_name: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().optional(),
  category: z.string().optional(),
  customer_name: z.string().optional(),
});

const updateRecordSchema = z.object({
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  customer_name: z.string().optional(),
});

const querySchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  source_id: z.string().uuid().optional(),
  category: z.string().optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
});

export class IncomeController {
  // GET /api/income
  async getRecords(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const query = querySchema.parse(req.query);

      const result = await incomeService.getRecords(userId, {
        startDate: query.start_date,
        endDate: query.end_date,
        sourceId: query.source_id,
        category: query.category,
        limit: query.limit,
        offset: query.offset,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/income/:id
  async getRecord(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const recordId = req.params.id as string;
      const record = await incomeService.getRecord(userId, recordId);

      if (!record) {
        return ApiResponse.notFound(res, 'Income record not found');
      }

      return ApiResponse.success(res, record);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/income
  async createRecord(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const data = createRecordSchema.parse(req.body);

      // Get or create source
      const source = await incomeService.getOrCreateSource(userId, data.source_name);

      const record = await incomeService.createRecord(userId, {
        source_id: source.id,
        amount: data.amount,
        currency: data.currency,
        transaction_date: data.transaction_date,
        description: data.description,
        category: data.category,
        customer_name: data.customer_name,
      });

      return ApiResponse.created(res, record, 'Income record created');
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/income/:id
  async updateRecord(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const recordId = req.params.id as string;
      const updates = updateRecordSchema.parse(req.body);
      const record = await incomeService.updateRecord(userId, recordId, updates);

      return ApiResponse.success(res, record, 'Income record updated');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/income/:id
  async deleteRecord(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const recordId = req.params.id as string;
      await incomeService.deleteRecord(userId, recordId);

      return ApiResponse.success(res, null, 'Income record deleted');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/income/sources
  async getSources(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const sources = await incomeService.getSources(userId);

      return ApiResponse.success(res, sources);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/income/summary
  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const { start_date, end_date } = req.query;

      const summary = await incomeService.getSummary(
        userId,
        start_date as string | undefined,
        end_date as string | undefined
      );

      return ApiResponse.success(res, summary);
    } catch (error) {
      next(error);
    }
  }
}

export const incomeController = new IncomeController();
