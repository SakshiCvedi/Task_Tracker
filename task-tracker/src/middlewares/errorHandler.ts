import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { env } from '../config/env';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
  const message = err.issues
    .map((e) => `${e.path.join('.')}: ${e.message}`)
    .join(', ');

  res.status(400).json({
    status: 400,
    code: 'VALIDATION_ERROR',
    message,
  });
  return;
}

  // Handle our custom AppError subclasses
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      code: err.code,
      message: err.message,
    });
    return;
  }

  // Handle Prisma unique constraint violations
  if ((err as any).code === 'P2002') {
    res.status(409).json({
      status: 409,
      code: 'CONFLICT',
      message: 'A record with this value already exists',
    });
    return;
  }

  // Handle Prisma record not found
  if ((err as any).code === 'P2025') {
    res.status(404).json({
      status: 404,
      code: 'NOT_FOUND',
      message: 'Record not found',
    });
    return;
  }

  // Unexpected errors — don't leak internals in production
  console.error('Unexpected error:', err);

  res.status(500).json({
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message:
      env.nodeEnv === 'development'
        ? err.message
        : 'An unexpected error occurred',
  });
};

// Catches async errors that weren't caught by try/catch
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: 404,
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
  });
};