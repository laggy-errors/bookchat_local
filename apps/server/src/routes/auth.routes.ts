import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  requestVerificationSchema,
  verifyEmailSchema,
} from '../validators/auth.validator';

// 1. Strict rate limiting specifically for auth endpoints (Volume 11, Section 5)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20000, // limit each IP to 20,000 auth-related requests per 15 minutes (prevent proxy blocking)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
    errorCode: 'TOO_MANY_AUTH_ATTEMPTS',
  },
});

const router = Router();

// Apply rate limiting specifically on the auth router
router.use(authLimiter);

// Authentication Routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);
router.post('/logout', validate(refreshTokenSchema), authController.logout);

// Google OAuth 2.0 Routes
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);

// Password Recovery Routes
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Email Verification Routes
router.post('/request-verification', validate(requestVerificationSchema), authController.requestEmailVerification);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

export const authRoutes = router;
