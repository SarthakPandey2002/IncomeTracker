import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../middleware/error.middleware';

const router = Router();

const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  plan: z.enum(['pro', 'business']),
});

// POST /api/v1/waitlist - Join waitlist
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, plan } = waitlistSchema.parse(req.body);

    const { error } = await supabaseAdmin
      .from('waitlist')
      .insert({ email, plan });

    if (error) {
      if (error.code === '23505') {
        // Duplicate email - that's okay, just say success
        return ApiResponse.success(res, { alreadyJoined: true }, "You're already on the waitlist!");
      }
      throw new AppError(`Failed to join waitlist: ${error.message}`);
    }

    return ApiResponse.created(res, { email, plan }, "You're on the waitlist! We'll notify you when Pro launches.");
  } catch (error) {
    next(error);
  }
});

export default router;
