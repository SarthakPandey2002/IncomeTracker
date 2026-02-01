import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { groqService } from '../services/groq.service';
import { incomeService } from '../services/income.service';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../middleware/error.middleware';

export class InsightsController {
  // GET /api/insights
  async getInsights(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const period = (req.query.period as string) || 'month';

      // Calculate date ranges based on period
      const now = new Date();
      let startDate: Date;
      let previousStartDate: Date;
      let previousEndDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          previousEndDate = new Date(startDate.getTime() - 1);
          previousStartDate = new Date(previousEndDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          previousEndDate = new Date(startDate.getTime() - 1);
          previousStartDate = new Date(previousEndDate.getFullYear(), 0, 1);
          break;
        case 'month':
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          previousEndDate = new Date(startDate.getTime() - 1);
          previousStartDate = new Date(previousEndDate.getFullYear(), previousEndDate.getMonth(), 1);
          break;
      }

      const formatDate = (d: Date) => d.toISOString().split('T')[0];

      // Get current period data
      const currentData = await incomeService.getSummary(
        userId,
        formatDate(startDate),
        formatDate(now)
      );

      // Get previous period data
      const previousData = await incomeService.getSummary(
        userId,
        formatDate(previousStartDate),
        formatDate(previousEndDate)
      );

      // Get recent transactions for context
      const { records: recentTransactions } = await incomeService.getRecords(userId, {
        startDate: formatDate(startDate),
        endDate: formatDate(now),
        limit: 10,
      });

      // Prepare data for Groq
      const sourceBreakdown = Object.entries(currentData.bySource).map(([source, amount]) => ({
        source,
        amount: amount as number,
        count: recentTransactions.filter((t) => t.income_sources?.source_name === source).length,
      }));

      const insightsData = {
        totalIncome: currentData.totalAmount,
        previousPeriodIncome: previousData.totalAmount,
        transactionCount: currentData.recordCount,
        sourceBreakdown,
        recentTransactions: recentTransactions.map((t) => ({
          description: t.description || '',
          amount: Number(t.amount),
          date: t.transaction_date,
          source: t.income_sources?.source_name || 'Unknown',
        })),
        period: period === 'week' ? 'This Week' : period === 'year' ? 'This Year' : 'This Month',
      };

      // Generate AI insights
      const insights = await groqService.generateInsights(insightsData);

      return ApiResponse.success(res, {
        insights,
        data: {
          currentPeriod: {
            totalIncome: currentData.totalAmount,
            transactionCount: currentData.recordCount,
            bySource: currentData.bySource,
          },
          previousPeriod: {
            totalIncome: previousData.totalAmount,
            transactionCount: previousData.recordCount,
          },
        },
        aiEnabled: groqService.isConfigured(),
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/insights/status
  async getStatus(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      return ApiResponse.success(res, {
        configured: groqService.isConfigured(),
        features: {
          smartCategorization: groqService.isConfigured(),
          incomeInsights: groqService.isConfigured(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const insightsController = new InsightsController();
