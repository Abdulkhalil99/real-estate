import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { JwtPayload } from '../types';

// ─── ACCESS TOKEN ─────────────────────────────────────────────────────────────
// Short-lived (15min) — sent in every API request header
// Contains userId, email, role so we don't need a DB call to identify the user

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
// Long-lived (30 days) — stored in DB, sent only to /auth/refresh endpoint
// We store a HASH of the token in DB, not the token itself
// If DB is compromised, attacker gets hashes not usable tokens

export function generateRefreshToken(): string {
  // 64 random bytes = 128 character hex string = very hard to guess
  return crypto.randomBytes(64).toString('hex');
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getRefreshTokenExpiry(): Date {
  // 30 days from now
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

// ─── VERIFY REFRESH TOKEN ─────────────────────────────────────────────────────
// We verify by looking up the hash in the database
// This is done in the auth service, not here