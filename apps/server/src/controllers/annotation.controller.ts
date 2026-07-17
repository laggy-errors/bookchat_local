import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { annotationService } from '../services/annotation.service';
import { UnauthorizedError } from '../utils/errors';

export class AnnotationController {
  async listAnnotations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { bookId } = req.query;
      const annotations = await annotationService.listAnnotations(userId, bookId as string);

      res.status(200).json({
        status: 'success',
        data: annotations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnnotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { annotationId } = req.params;
      const annotation = await annotationService.getAnnotation(annotationId, userId);

      res.status(200).json({
        status: 'success',
        data: annotation,
      });
    } catch (error) {
      next(error);
    }
  }

  async createAnnotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const annotation = await annotationService.createAnnotation(userId, req.body);

      res.status(201).json({
        status: 'success',
        data: annotation,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAnnotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { annotationId } = req.params;
      const annotation = await annotationService.updateAnnotation(annotationId, userId, req.body);

      res.status(200).json({
        status: 'success',
        data: annotation,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAnnotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { annotationId } = req.params;
      await annotationService.deleteAnnotation(annotationId, userId);

      res.status(200).json({
        status: 'success',
        message: 'Annotation deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const annotationController = new AnnotationController();
