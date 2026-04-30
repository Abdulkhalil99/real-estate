import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  uploadPropertyImages,
  uploadAvatar,
} from '../config/upload';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

// ── Property Images ───────────────────────────────────────────────────────────
// "images" = the field name the client must use in FormData
// array(10) = accept up to 10 files
router.post(
  '/properties/:propertyId/images',
  authorize('AGENT', 'ADMIN'),
  uploadPropertyImages.array('images', 10),
  uploadController.uploadPropertyImages
);

// ── Avatar ────────────────────────────────────────────────────────────────────
// single('avatar') = accept exactly one file in the "avatar" field
router.post(
  '/avatar',
  uploadAvatar.single('avatar'),
  uploadController.uploadAvatar
);

// ── Image Management ──────────────────────────────────────────────────────────
router.delete(
  '/images/:imageId',
  authorize('AGENT', 'ADMIN'),
  uploadController.deleteImage
);

router.put(
  '/images/:imageId/primary',
  authorize('AGENT', 'ADMIN'),
  uploadController.setPrimary
);

export default router;