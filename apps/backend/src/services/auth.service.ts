import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { CONSTANTS } from '../config/constants';
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/token';
import {
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from '../validators/auth.validator';
import { JwtPayload, UserRole } from '../types';
import { AppError } from '../middleware/error.middleware';

// Fields we ALWAYS return for a user — never include password
const userSelect = {
  id:        true,
  email:     true,
  firstName: true,
  lastName:  true,
  role:      true,
  phone:     true,
  avatar:    true,
  createdAt: true,
};

// Helper — builds both tokens and saves refresh token to DB
async function issueTokens(userId: string, email: string, role: UserRole) {
  // 1. Build access token payload
  const payload: JwtPayload = { userId, email, role };

  // 2. Generate access token (short-lived JWT)
  const accessToken = generateAccessToken(payload);

  // 3. Generate refresh token (random hex string)
  const refreshToken = generateRefreshToken();

  // 4. Store HASH of refresh token in DB (never the raw token)
  await prisma.refreshToken.create({
    data: {
      token:     hashRefreshToken(refreshToken),
      userId,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return { accessToken, refreshToken };
}

export const authService = {

  // ── REGISTER ───────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const existing = await prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new AppError('Email already registered', 409);

    const hashedPassword = await bcrypt.hash(dto.password, CONSTANTS.BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email:     dto.email,
        password:  hashedPassword,
        firstName: dto.firstName,
        lastName:  dto.lastName,
        phone:     dto.phone,
      },
      select: userSelect,
    });

    const { accessToken, refreshToken } = await issueTokens(
      user.id,
      user.email,
      user.role as UserRole
    );

    return { user, accessToken, refreshToken };
  },

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    // Always fetch with password for comparison
    const user = await prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Same error whether email is wrong or password is wrong
    // This prevents user enumeration attacks
    if (!user) throw new AppError('Invalid email or password', 401);

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new AppError('Invalid email or password', 401);

    const { accessToken, refreshToken } = await issueTokens(
      user.id,
      user.email,
      user.role as UserRole
    );

    // Return user without password
    const { password: _, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  },

  // ── REFRESH TOKEN ──────────────────────────────────────────────────────────
  // Client sends the refresh token → we verify it → issue new access token
  async refresh(rawRefreshToken: string) {
    const tokenHash = hashRefreshToken(rawRefreshToken);

    // Look up the hashed token in the database
    const stored = await prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: { user: { select: userSelect } },
    });

    // Token not found — it was never issued or already deleted
    if (!stored) throw new AppError('Invalid refresh token', 401);

    // Token expired
    if (stored.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { token: tokenHash } });
      throw new AppError('Refresh token expired, please login again', 401);
    }

    // Issue a new access token
    const accessToken = generateAccessToken({
      userId: stored.userId,
      email:  stored.user.email,
      role:   stored.user.role as UserRole,
    });

    return { accessToken, user: stored.user };
  },

  // ── LOGOUT ─────────────────────────────────────────────────────────────────
  // Delete the refresh token from DB — it can never be used again
  async logout(rawRefreshToken: string) {
    const tokenHash = hashRefreshToken(rawRefreshToken);

    await prisma.refreshToken.deleteMany({
      where: { token: tokenHash },
    });
    // No error if token not found — idempotent logout is fine
  },

  // ── LOGOUT ALL DEVICES ─────────────────────────────────────────────────────
  // Delete ALL refresh tokens for this user
  async logoutAll(userId: string) {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  },

  // ── GET PROFILE ────────────────────────────────────────────────────────────
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...userSelect,
        _count: {
          select: {
            properties: true,
            inquiries:  true,
          },
        },
      },
    });

    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  // ── UPDATE PROFILE ─────────────────────────────────────────────────────────
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await prisma.user.update({
      where: { id: userId },
      data:  dto,
      select: userSelect,
    });
    return user;
  },

  // ── CHANGE PASSWORD ────────────────────────────────────────────────────────
  async changePassword(userId: string, dto: ChangePasswordDto) {
    // Fetch user WITH password for comparison
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    // Verify current password is correct
    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) throw new AppError('Current password is incorrect', 400);

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(
      dto.newPassword,
      CONSTANTS.BCRYPT_SALT_ROUNDS
    );

    await prisma.user.update({
      where: { id: userId },
      data:  { password: hashedPassword },
    });

    // Invalidate all refresh tokens — force re-login on all devices
    await prisma.refreshToken.deleteMany({ where: { userId } });
  },
};