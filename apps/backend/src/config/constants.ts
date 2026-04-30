export const CONSTANTS = {
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,

  // Auth
  BCRYPT_SALT_ROUNDS: 12,   // higher = more secure but slower
  JWT_COOKIE_NAME: 'auth_token',

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,   // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,

  // Property images
  MAX_IMAGES_PER_PROPERTY: 20,

  // API
  API_PREFIX: '/api/v1',
} as const;