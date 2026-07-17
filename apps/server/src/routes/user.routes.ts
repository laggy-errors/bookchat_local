import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../validators/user.validator';

const router = Router();

router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);
router.delete('/account', userController.deleteAccount);

export const userRoutes = router;
