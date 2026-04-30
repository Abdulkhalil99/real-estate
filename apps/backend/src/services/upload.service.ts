import path from 'path';
import { prisma } from '../config/prisma';
import {
  getPropertyImageUrl,
  getAvatarUrl,
  deleteFile,
  UPLOAD_CONFIG,
} from '../config/upload';
import { AppError } from '../middleware/error.middleware';

export const uploadService = {

  // ── SAVE PROPERTY IMAGES ──────────────────────────────────────────────────
  // Called after multer saves files to disk
  // Saves image records to the database and returns the public URLs
  async savePropertyImages(
    files:      Express.Multer.File[],
    propertyId: string,
    requesterId: string,
    requesterRole: string
  ) {
    // Verify the property exists and requester has permission
    const property = await prisma.property.findUnique({
      where:  { id: propertyId },
      select: { id: true, agentId: true },
    });

    if (!property) {
      // If property not found, delete the uploaded files immediately
      // No point keeping orphan files on disk
      files.forEach((f) => deleteFile(f.path));
      throw new AppError('Property not found', 404);
    }

    if (property.agentId !== requesterId && requesterRole !== 'ADMIN') {
      files.forEach((f) => deleteFile(f.path));
      throw new AppError('You can only add images to your own properties', 403);
    }

    // Check how many images this property already has
    const existingCount = await prisma.propertyImage.count({
      where: { propertyId },
    });

    if (existingCount + files.length > UPLOAD_CONFIG.MAX_FILES) {
      files.forEach((f) => deleteFile(f.path));
      throw new AppError(
        `Maximum ${UPLOAD_CONFIG.MAX_FILES} images per property. ` +
        `Property already has ${existingCount}.`,
        400
      );
    }

    // Check if property already has a primary image
    const hasPrimary = await prisma.propertyImage.findFirst({
      where: { propertyId, isPrimary: true },
    });

    // Create image records in the database
    const images = await prisma.$transaction(
      files.map((file, index) =>
        prisma.propertyImage.create({
          data: {
            url:        getPropertyImageUrl(file.filename),
            isPrimary:  !hasPrimary && index === 0,  // first image = primary if none exist
            order:      existingCount + index + 1,
            propertyId,
          },
        })
      )
    );

    return images;
  },

  // ── SAVE AVATAR ───────────────────────────────────────────────────────────
  async saveAvatar(file: Express.Multer.File, userId: string) {
    // Find and delete the old avatar file from disk (if any)
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { avatar: true },
    });

    if (user?.avatar) {
      // Extract filename from URL and delete from disk
      const oldFilename = path.basename(user.avatar);
      const oldPath     = path.join(UPLOAD_CONFIG.AVATAR_DIR, oldFilename);
      deleteFile(oldPath);
    }

    const avatarUrl = getAvatarUrl(file.filename);

    // Update user record with new avatar URL
    const updated = await prisma.user.update({
      where:  { id: userId },
      data:   { avatar: avatarUrl },
      select: { id: true, avatar: true, firstName: true, lastName: true },
    });

    return updated;
  },

  // ── DELETE IMAGE ──────────────────────────────────────────────────────────
  async deletePropertyImage(
    imageId:      string,
    requesterId:  string,
    requesterRole: string
  ) {
    // Find the image and its property in one query
    const image = await prisma.propertyImage.findUnique({
      where:   { id: imageId },
      include: { property: { select: { agentId: true, id: true } } },
    });

    if (!image) throw new AppError('Image not found', 404);

    // Check permission
    if (image.property.agentId !== requesterId && requesterRole !== 'ADMIN') {
      throw new AppError('You can only delete images from your own properties', 403);
    }

    // Delete from database first
    await prisma.propertyImage.delete({ where: { id: imageId } });

    // Then delete from disk
    const filename = path.basename(image.url);
    const filepath = path.join(UPLOAD_CONFIG.PROPERTY_DIR, filename);
    deleteFile(filepath);

    // If we deleted the primary image, make the next one primary
    if (image.isPrimary) {
      const nextImage = await prisma.propertyImage.findFirst({
        where:   { propertyId: image.property.id },
        orderBy: { order: 'asc' },
      });

      if (nextImage) {
        await prisma.propertyImage.update({
          where: { id: nextImage.id },
          data:  { isPrimary: true },
        });
      }
    }

    return { deleted: true, imageId };
  },

  // ── SET PRIMARY IMAGE ─────────────────────────────────────────────────────
  async setPrimaryImage(
    imageId:      string,
    requesterId:  string,
    requesterRole: string
  ) {
    const image = await prisma.propertyImage.findUnique({
      where:   { id: imageId },
      include: { property: { select: { agentId: true, id: true } } },
    });

    if (!image) throw new AppError('Image not found', 404);

    if (image.property.agentId !== requesterId && requesterRole !== 'ADMIN') {
      throw new AppError('You do not have permission', 403);
    }

    // Use a transaction:
    // 1. Set all images for this property to isPrimary: false
    // 2. Set the selected image to isPrimary: true
    // Both happen together — no inconsistent state possible
    await prisma.$transaction([
      prisma.propertyImage.updateMany({
        where: { propertyId: image.property.id },
        data:  { isPrimary: false },
      }),
      prisma.propertyImage.update({
        where: { id: imageId },
        data:  { isPrimary: true },
      }),
    ]);

    return { updated: true, primaryImageId: imageId };
  },
};