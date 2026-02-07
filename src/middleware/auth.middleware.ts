import { Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AuthenticatedRequest } from '../types';
import { ApiResponse } from '../utils/apiResponse';

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ApiResponse.unauthorized(res, 'Missing or invalid authorization header');
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      ApiResponse.unauthorized(res, 'Missing token');
      return;
    }

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      ApiResponse.unauthorized(res, 'Invalid or expired token');
      return;
    }

    // Attach user to request
    req.user = data.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    ApiResponse.serverError(res, 'Authentication error');
  }
}
