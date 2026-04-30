import { PrismaClient } from '@prisma/client';
import { env } from './env';

// In development, hot-reloading would create a new PrismaClient on every
// file change — this would exhaust the connection pool quickly.
// We store one instance on the global object to survive hot reloads.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDevelopment
      ? ['query', 'error', 'warn']   // show SQL queries in dev
      : ['error'],                    // only errors in production
  });

if (env.isDevelopment) {
  globalForPrisma.prisma = prisma;
}

export default prisma;