import { Router } from 'express';
import multer from 'multer';
import { csvController } from '../controllers/csv.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadRateLimiter, REQUEST_SIZE_LIMITS } from '../middleware/security.middleware';

const router = Router();

// Configure multer for file uploads (in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: REQUEST_SIZE_LIMITS.upload * 1024 * 1024, // Convert MB to bytes
  },
  fileFilter: (_req, file, cb) => {
    // Check file extension and MIME type for CSV and XLSX
    const allowedMimeTypes = [
      'text/csv',
      'application/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    ];
    const fileName = file.originalname.toLowerCase();
    const isAllowedMime = allowedMimeTypes.includes(file.mimetype);
    const isCSVExtension = fileName.endsWith('.csv');
    const isXLSXExtension = fileName.endsWith('.xlsx');

    if (isAllowedMime || isCSVExtension || isXLSXExtension) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and XLSX files are allowed'));
    }
  },
});

// All routes require authentication
router.use(authMiddleware);

// Get supported platforms (no rate limit needed - just returns static data)
router.get('/platforms', csvController.getPlatforms.bind(csvController));

// Preview CSV (get headers and sample rows)
// Apply upload rate limit to prevent abuse
router.post(
  '/preview',
  uploadRateLimiter,
  upload.single('file'),
  csvController.preview.bind(csvController)
);

// Import CSV with column mapping
// This is the actual import, so rate limit is important
router.post(
  '/import',
  uploadRateLimiter,
  upload.single('file'),
  csvController.import.bind(csvController)
);

export default router;
