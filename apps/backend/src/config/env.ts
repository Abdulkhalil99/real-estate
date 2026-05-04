import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const env = {
  NODE_ENV:    optionalEnv('NODE_ENV', 'development'),
  PORT:        parseInt(optionalEnv('PORT', '5000'), 10),

  DATABASE_URL:           requireEnv('DATABASE_URL'),

  JWT_SECRET:             requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN:         optionalEnv('JWT_EXPIRES_IN', '15m'),
  JWT_REFRESH_SECRET:     requireEnv('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: optionalEnv('JWT_REFRESH_EXPIRES_IN', '30d'),

  FRONTEND_URL: optionalEnv('FRONTEND_URL', 'http://localhost:3000'),
  BASE_URL:     optionalEnv('BASE_URL', 'http://localhost:5000'),

  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction:  process.env.NODE_ENV === 'production',
  isTest:        process.env.NODE_ENV === 'test',
};
