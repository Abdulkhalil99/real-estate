import { Router } from 'express';
import { propertyController } from '../controllers/property.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  createPropertySchema,
  updatePropertySchema,
  updateStatusSchema,
} from '../validators/property.validator';

const router = Router();

// ── Public routes — no auth needed ───────────────────────────────────────────
// ORDER MATTERS — specific routes must come before /:id
// otherwise Express will match "featured", "my", "stats" as IDs
router.get('/featured', propertyController.getFeatured);
router.get('/stats',    propertyController.getStats);
router.get('/',         propertyController.getAll);

// ── Protected routes — must be logged in as AGENT or ADMIN ───────────────────
router.get(
  '/my/listings',
  authenticate,
  authorize('AGENT', 'ADMIN'),
  propertyController.getMy
);

router.get('/:id', propertyController.getOne);

router.post(
  '/',
  authenticate,
  authorize('AGENT', 'ADMIN'),
  validate(createPropertySchema),
  propertyController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('AGENT', 'ADMIN'),
  validate(updatePropertySchema),
  propertyController.update
);

router.put(
  '/:id/status',
  authenticate,
  authorize('AGENT', 'ADMIN'),
  validate(updateStatusSchema),
  propertyController.updateStatus
);

router.delete(
  '/:id',
  authenticate,
  authorize('AGENT', 'ADMIN'),
  propertyController.remove
);

export default router;
