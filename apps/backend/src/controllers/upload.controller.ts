import { Response } from 'express';
import { uploadService } from '../services/upload.service';
import { AuthRequest } from '../types';
import { asyncAuthHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, HttpError } from '../utils/apiResponse';
import { AppError } from '../middleware/error.middleware';

export const uploadController = {

  // POST /api/v1/upload/properties/:propertyId/images
  // Accepts: multipart/form-data with field name "images"
  uploadPropertyImages: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    // req.files is set by multer middleware
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      HttpError.badRequest(res, 'No images provided. Send files in the "images" field.');
      return;
    }

    const images = await uploadService.savePropertyImages(
      files,
      req.params.propertyId,
      req.user!.userId,
      req.user!.role
    );

    sendCreated(res, images, `${images.length} image(s) uploaded successfully`);
  }),

  // POST /api/v1/upload/avatar
  // Accepts: multipart/form-data with field name "avatar"
  uploadAvatar: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    const file = req.file;  // single file — req.file not req.files

    if (!file) {
      HttpError.badRequest(res, 'No image provided. Send file in the "avatar" field.');
      return;
    }

    const user = await uploadService.saveAvatar(file, req.user!.userId);
    sendSuccess(res, user, 'Avatar updated successfully');
  }),

  // DELETE /api/v1/upload/images/:imageId
  deleteImage: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    const result = await uploadService.deletePropertyImage(
      req.params.imageId,
      req.user!.userId,
      req.user!.role
    );
    sendSuccess(res, result, 'Image deleted successfully');
  }),

  // PUT /api/v1/upload/images/:imageId/primary
  setPrimary: asyncAuthHandler(async (req: AuthRequest, res: Response) => {
    const result = await uploadService.setPrimaryImage(
      req.params.imageId,
      req.user!.userId,
      req.user!.role
    );
    sendSuccess(res, result, 'Primary image updated');
  }),
};