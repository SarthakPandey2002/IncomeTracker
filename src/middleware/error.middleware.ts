import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '../utils/apiResponse';
import { env } from '../config/env';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  // Always log errors to console for debugging (visible in Render logs)
  console.error('Error:', err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    return ApiResponse.error(res, messages.join(', '), 400);
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  // Handle unknown errors
  return ApiResponse.serverError(
    res,
    env.nodeEnv === 'development' ? err.message : 'Internal server error'
  );
}
