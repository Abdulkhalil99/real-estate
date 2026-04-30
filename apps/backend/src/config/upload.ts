import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { AppError } from '../middleware/error.middleware';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE:     5 * 1024 * 1024,   // 5MB per file
  MAX_FILES:         10,                 // max 10 images per request
  MAX_AVATAR_SIZE:   2 * 1024 * 1024,   // 2MB for avatars
  ALLOWED_TYPES:     ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS:['.jpg', '.jpeg', '.png', '.webp'],
  PROPERTY_DIR:      path.join(process.cwd(), 'uploads', 'properties'),
  AVATAR_DIR:        path.join(process.cwd(), 'uploads', 'avatars'),
  BASE_URL:          process.env.BASE_URL || 'http://localhost:5000',
};

// ─── ENSURE FOLDERS EXIST ─────────────────────────────────────────────────────
// Create upload directories if they don't exist yet
// This runs once when the server starts
[UPLOAD_CONFIG.PROPERTY_DIR, UPLOAD_CONFIG.AVATAR_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ─── FILE FILTER ──────────────────────────────────────────────────────────────
// This function runs for every file before it is saved
// Return cb(null, true) to accept, cb(error) to reject
function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  // Check MIME type (what the browser says the file is)
  if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.mimetype)) {
    cb(new AppError(
      `Invalid file type. Allowed: ${UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`,
      400
    ));
    return;
  }

  // Check file extension as a second layer of validation
  const ext = path.extname(file.originalname).toLowerCase();
  if (!UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new AppError('Invalid file extension', 400));
    return;
  }

  cb(null, true);   // accept the file
}

// ─── STORAGE: PROPERTY IMAGES ─────────────────────────────────────────────────
// DiskStorage saves files directly to the filesystem
const propertyStorage = multer.diskStorage({
  // Where to save the file
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_CONFIG.PROPERTY_DIR);
  },

  // What to name the file
  // NEVER use the original name — security risk
  // Use UUID + original extension: "a1b2c3d4-e5f6.jpg"
  filename: (_req, file, cb) => {
    const ext      = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// ─── STORAGE: AVATARS ─────────────────────────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_CONFIG.AVATAR_DIR);
  },
  filename: (_req, file, cb) => {
    const ext      = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// ─── MULTER INSTANCES ─────────────────────────────────────────────────────────
// Export configured multer instances — used in routes
export const uploadPropertyImages = multer({
  storage:    propertyStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,   // 5MB per file
    files:    UPLOAD_CONFIG.MAX_FILES,       // max 10 files
  },
});

export const uploadAvatar = multer({
  storage:    avatarStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_AVATAR_SIZE,   // 2MB
    files:    1,                               // only 1 avatar
  },
});

// ─── URL HELPER ───────────────────────────────────────────────────────────────
// Convert a local filename to the full public URL
// e.g. "a1b2.jpg" → "http://localhost:5000/uploads/properties/a1b2.jpg"
export function getPropertyImageUrl(filename: string): string {
  return `${UPLOAD_CONFIG.BASE_URL}/uploads/properties/${filename}`;
}

export function getAvatarUrl(filename: string): string {
  return `${UPLOAD_CONFIG.BASE_URL}/uploads/avatars/${filename}`;
}

// ─── DELETE HELPER ────────────────────────────────────────────────────────────
// Delete a file from disk safely
// Returns true if deleted, false if file didn't exist
export function deleteFile(filepath: string): boolean {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}