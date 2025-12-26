import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with connection pool limits to prevent
// overwhelming the database during static page generation
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Prevent multiple instances in development (hot reload)
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Gracefully disconnect on serverless function end
// This helps release connections back to the pool
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

/**
 * Retry wrapper for Prisma operations that may fail due to connection pool exhaustion
 * Use this for critical database operations during static generation
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Check if it's a connection pool timeout error (P2024)
      const isPrismaError = error instanceof Prisma.PrismaClientKnownRequestError;
      const isPoolTimeout = isPrismaError && error.code === 'P2024';
      const isConnectionError = error instanceof Prisma.PrismaClientInitializationError;

      if (!isPoolTimeout && !isConnectionError) {
        // Not a retryable error, throw immediately
        throw error;
      }

      // Exponential backoff with jitter
      const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;

      console.warn(
        `Database connection retry ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`,
        { error: (error as Error).message }
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

