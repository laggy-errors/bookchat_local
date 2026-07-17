import { Router } from 'express';
import { annotationController } from '../controllers/annotation.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createAnnotationSchema,
  updateAnnotationSchema,
  annotationIdParamSchema,
} from '../validators/annotation.validator';

const router = Router();

router.use(authMiddleware);

router.get('/', annotationController.listAnnotations);
router.get('/:annotationId', validate(annotationIdParamSchema), annotationController.getAnnotation);
router.post('/', validate(createAnnotationSchema), annotationController.createAnnotation);
router.patch('/:annotationId', validate(updateAnnotationSchema), annotationController.updateAnnotation);
router.delete('/:annotationId', validate(annotationIdParamSchema), annotationController.deleteAnnotation);

export const annotationRoutes = router;
