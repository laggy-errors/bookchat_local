import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../utils/errors';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Stub behavior: if no token is found, throw UnauthorizedError or fall back to mock user in dev/test context
    // This allows testing the stub before full authentication implementation
    if (config.nodeEnv === 'development') {
      // Inject mock user for developer ease
      req.user = {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'mock.archivist@bookchat.org',
      };
      return next();
    }
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string };
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
}
