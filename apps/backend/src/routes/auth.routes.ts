import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.validator';

const router = Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.post('/register', validate(registerSchema),      authController.register);
router.post('/login',    validate(loginSchema),         authController.login);
router.post('/refresh',  validate(refreshTokenSchema),  authController.refresh);

// ── Protected routes — must send valid JWT ────────────────────────────────────
router.post('/logout',          authenticate, authController.logout);
router.post('/logout-all',      authenticate, authController.logoutAll);
router.get( '/me',              authenticate, authController.getMe);
router.put( '/me',              authenticate, validate(updateProfileSchema), authController.updateMe);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;