import { Router } from 'express';
import { bookController } from '../controllers/book.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBookSchema, bookIdParamSchema, joinBookSchema } from '../validators/book.validator';

const router = Router();

// Books can be public to view but creation needs auth
router.get('/', bookController.listBooks);
router.get('/mine', authMiddleware, bookController.listMyBooks);
router.get('/:bookId', validate(bookIdParamSchema), bookController.getBook);
router.patch('/:bookId', authMiddleware, validate(bookIdParamSchema), bookController.updateBook);

router.post('/', authMiddleware, validate(createBookSchema), bookController.createBook);
router.post('/join', authMiddleware, validate(joinBookSchema), bookController.joinBook);
router.get('/:bookId/visible-members', authMiddleware, validate(bookIdParamSchema), bookController.getVisibleMembers);

// Visibility grants routes
router.get('/:bookId/visibility-grants', authMiddleware, validate(bookIdParamSchema), bookController.listVisibilityGrants);
router.post('/:bookId/visibility-grants', authMiddleware, validate(bookIdParamSchema), bookController.createVisibilityGrant);
router.delete('/:bookId/visibility-grants/:grantId', authMiddleware, bookController.deleteVisibilityGrant);

// Member nickname and removal routes
router.delete('/:bookId/members/:userId', authMiddleware, bookController.removeMember);
router.post('/:bookId/members/:userId/nickname', authMiddleware, bookController.updateNickname);
router.delete('/:bookId/leave', authMiddleware, validate(bookIdParamSchema), bookController.leaveBook);

export const bookRoutes = router;
