import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateThemeSchema } from '../validators/settings.validator';

const router = Router();

router.use(authMiddleware);

router.get('/theme', settingsController.getThemePreference);
router.put('/theme', validate(updateThemeSchema), settingsController.updateThemePreference);

export const settingsRoutes = router;
