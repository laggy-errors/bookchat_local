import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { config } from '../config';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const errorCode = err instanceof AppError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  if (config.nodeEnv === 'development' || !err.statusCode) {
    console.error('Error details:', err);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    errorCode,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
}
