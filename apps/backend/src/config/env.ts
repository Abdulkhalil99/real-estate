import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),

  DATABASE_URL: requireEnv('DATABASE_URL'),

  // Access token — short lived
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',

  // Refresh token — long lived, stored in DB
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction:  process.env.NODE_ENV === 'production',
  isTest:        process.env.NODE_ENV === 'test',
};