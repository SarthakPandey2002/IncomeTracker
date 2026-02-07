import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { csvService } from '../services/csv.service';
import { incomeService } from '../services/income.service';
import { groqService } from '../services/groq.service';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../middleware/error.middleware';

// Validation schemas
const columnMappingSchema = z.object({
  amount: z.string().min(1),
  date: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  customer: z.string().optional(),
  currency: z.string().optional(),
  transaction_id: z.string().optional(),
});

const importSchema = z.object({
  source_name: z.string().min(1),
  mapping: columnMappingSchema,
});

export class CsvController {
  // Helper to detect file type from filename
  private getFileType(filename: string): 'csv' | 'xlsx' {
    return filename.toLowerCase().endsWith('.xlsx') ? 'xlsx' : 'csv';
  }

  // POST /api/csv/preview
  async preview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Unauthorized', 401);

      const file = req.file;
      if (!file) {
        throw new AppError('No file provided. Please upload a CSV or XLSX file.');
      }

      const fileType = this.getFileType(file.originalname);
      const fileContent = fileType === 'xlsx' ? file.buffer : file.buffer.toString('utf-8');
      const preview = csvService.parsePreview(fileContent, 5, fileType);

      // Try to detect platform
      const detectedPlatform = csvService.detectPlatform(preview.headers);
      const suggestedMapping = detectedPlatform
        ? csvService.getSuggestedMapping(detectedPlatform)
        : null;

      return ApiResponse.success(res, {
        preview,
        detectedPlatform,
        suggestedMapping,
        fileType,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/csv/import
  async import(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    console.log('[CSV Import] Starting import request');
    try {
      const userId = req.user?.id;
      console.log('[CSV Import] User ID:', userId);
      if (!userId) throw new AppError('Unauthorized', 401);

      const file = req.file;
      console.log('[CSV Import] File:', file?.originalname);
      if (!file) {
        throw new AppError('No file provided. Please upload a CSV or XLSX file.');
      }

      // Parse mapping from JSON string (FormData sends it as string)
      console.log('[CSV Import] Request body:', req.body);
      const body = {
        source_name: req.body.source_name,
        mapping: typeof req.body.mapping === 'string'
          ? JSON.parse(req.body.mapping)
          : req.body.mapping,
      };
      console.log('[CSV Import] Parsed body:', body);

      const { source_name, mapping } = importSchema.parse(body);
      const fileType = this.getFileType(file.originalname);
      const fileContent = fileType === 'xlsx' ? file.buffer : file.buffer.toString('utf-8');

      // Parse file with mapping
      const parsedRecords = csvService.parseWithMapping(fileContent, mapping, source_name, fileType);

      if (parsedRecords.length === 0) {
        throw new AppError('No valid records found in the file');
      }

      // Get or create source
      const source = await incomeService.getOrCreateSource(userId, source_name);

      // Smart Categorization: categorize records without categories
      const recordsNeedingCategorization = parsedRecords
        .filter((r) => !r.category || r.category === 'Other')
        .map((r) => ({
          description: r.description || '',
          amount: Number(r.amount),
          source: source_name,
        }));

      let categorizedMap: Map<string, string> = new Map();

      if (recordsNeedingCategorization.length > 0 && groqService.isConfigured()) {
        try {
          const categorized = await groqService.categorizeTransactions(recordsNeedingCategorization);
          categorized.forEach((c) => {
            if (c.confidence > 0.5) {
              categorizedMap.set(c.description, c.category);
            }
          });
        } catch (error) {
          console.error('Smart categorization failed, using defaults:', error);
        }
      }

      // Add source_id and apply AI categories to records
      const recordsWithSource = parsedRecords.map((r) => {
        const aiCategory = categorizedMap.get(r.description || '');
        return {
          ...r,
          source_id: source.id,
          category: r.category && r.category !== 'Other' ? r.category : (aiCategory || r.category || 'Other'),
        };
      });

      // Insert records
      const result = await incomeService.createRecords(userId, recordsWithSource);

      return ApiResponse.success(res, {
        source: source.source_name,
        imported: result.inserted,
        duplicatesSkipped: result.duplicates,
        totalInFile: parsedRecords.length,
        aiCategorized: categorizedMap.size,
      }, `Successfully imported ${result.inserted} records`);
    } catch (error) {
      console.error('[CSV Import] Error:', error);
      next(error);
    }
  }

  // GET /api/csv/platforms
  async getPlatforms(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Return list of supported platforms with their expected columns
      const platforms = [
        {
          name: 'patreon',
          displayName: 'Patreon',
          expectedColumns: ['Patron', 'Pledge', 'Created', 'Tier'],
        },
        {
          name: 'gumroad',
          displayName: 'Gumroad',
          expectedColumns: ['Email', 'Price', 'Created At', 'Product', 'Order Number'],
        },
        {
          name: 'stripe',
          displayName: 'Stripe',
          expectedColumns: ['id', 'Amount', 'Created', 'Description', 'Currency'],
        },
        {
          name: 'paypal',
          displayName: 'PayPal',
          expectedColumns: ['Transaction ID', 'Gross', 'Date', 'Name', 'Currency'],
        },
      ];

      return ApiResponse.success(res, platforms);
    } catch (error) {
      next(error);
    }
  }
}

export const csvController = new CsvController();
