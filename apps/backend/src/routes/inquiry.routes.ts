import { Router } from 'express';
import { inquiryController } from '../controllers/inquiry.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { createInquirySchema, updateInquiryStatusSchema } from '../validators/inquiry.validator';

const router = Router();

// Anyone can submit an inquiry (even without an account)
router.post('/', validate(createInquirySchema), inquiryController.create);

// Agents and admins can view and manage inquiries
router.get('/',
  authenticate,
  authorize('AGENT', 'ADMIN'),
  inquiryController.getAll
);

router.get('/:id',
  authenticate,
  authorize('AGENT', 'ADMIN'),
  inquiryController.getOne
);

router.put('/:id/status',
  authenticate,
  authorize('AGENT', 'ADMIN'),
  validate(updateInquiryStatusSchema),
  inquiryController.updateStatus
);

export default router;