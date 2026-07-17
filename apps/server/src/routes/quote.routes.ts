import { Router } from 'express';
import { quoteController } from '../controllers/quote.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createQuoteSchema,
  updateQuoteSchema,
  quoteIdParamSchema,
} from '../validators/quote.validator';

const router = Router();

router.use(authMiddleware);

router.get('/', quoteController.listQuotes);
router.get('/:quoteId', validate(quoteIdParamSchema), quoteController.getQuote);
router.post('/', validate(createQuoteSchema), quoteController.createQuote);
router.patch('/:quoteId', validate(updateQuoteSchema), quoteController.updateQuote);
router.delete('/:quoteId', validate(quoteIdParamSchema), quoteController.deleteQuote);

export const quoteRoutes = router;
