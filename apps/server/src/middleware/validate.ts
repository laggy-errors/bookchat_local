import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

export function validate(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as any;
      
      // Assign parsed values back to req
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        next(new BadRequestError(`Validation Failed: ${issues}`, 'VALIDATION_ERROR'));
      } else {
        next(error);
      }
    }
  };
}

