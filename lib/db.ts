import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Enhance database URL with connection pool parameters
 * During static generation, Next.js generates many pages concurrently
 * We need proper connection pooling to handle concurrent requests
 * 
 * Note: For Supabase, ensure DATABASE_URL uses the connection pooler:
 * - Pooler: pooler.xxx.supabase.co:6543 (transaction mode, recommended for Prisma)
 * - Direct: db.xxx.supabase.co:5432 (for migrations only, use DIRECT_URL)
 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    const urlObj = new URL(url);
    
    // Check current values and override if they're too low
    const currentConnectionLimit = urlObj.searchParams.get('connection_limit');
    const currentPoolTimeout = urlObj.searchParams.get('pool_timeout');
    
    // Determine recommended values based on connection type
    const isSupabasePooler = urlObj.hostname.includes('pooler.supabase.co') || 
                            urlObj.hostname.includes('supabase.co') && urlObj.port === '6543';
    const recommendedConnectionLimit = isSupabasePooler ? '20' : '15';
    const recommendedPoolTimeout = '60';
    
    // Override if not set or if current value is too low (below our recommended minimum)
    if (!currentConnectionLimit || parseInt(currentConnectionLimit) < 10) {
      urlObj.searchParams.set('connection_limit', recommendedConnectionLimit);
    }
    
    if (!currentPoolTimeout || parseInt(currentPoolTimeout) < 30) {
      urlObj.searchParams.set('pool_timeout', recommendedPoolTimeout);
    }
    
    // Always set connect_timeout for faster failure detection
    urlObj.searchParams.set('connect_timeout', '10');
    
    return urlObj.toString();
  } catch {
    // If URL parsing fails, append parameters manually (overriding any existing ones)
    // Remove existing parameters first by parsing and rebuilding
    const baseUrl = url.split('?')[0];
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}connection_limit=20&pool_timeout=60&connect_timeout=10`;
  }
}

// Create Prisma client with connection pool configuration
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
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
 * 
 * Increased retries and delays for build-time operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 5,
  baseDelayMs: number = 2000
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
      // Longer delays for connection pool issues (2s, 4s, 8s, 16s, 32s)
      const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000;

      console.warn(
        `Database connection retry ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`,
        { error: (error as Error).message }
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

