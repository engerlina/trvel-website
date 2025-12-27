import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Connection semaphore to limit concurrent database operations
 * This prevents overwhelming the connection pool during static generation
 * 
 * During build, Next.js generates many pages concurrently. Even with a large
 * connection pool, if 100 pages all try to query the DB at once, we'll exhaust it.
 * This semaphore ensures only a limited number of DB operations run concurrently.
 */
class ConnectionSemaphore {
  private permits: number;
  private waitQueue: Array<() => void> = [];

  constructor(maxConcurrent: number = 10) {
    this.permits = maxConcurrent;
  }

  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      if (this.permits > 0) {
        this.permits--;
        resolve();
      } else {
        this.waitQueue.push(resolve);
      }
    });
  }

  release(): void {
    this.permits++;
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift();
      if (next) {
        this.permits--;
        next();
      }
    }
  }
}

// Global semaphore instance - limit concurrent DB operations
// This is lower than connection_limit to account for connection overhead and Supabase limits
// Can be overridden with DB_SEMAPHORE_LIMIT env var (default: 8)
const dbSemaphore = new ConnectionSemaphore(
  parseInt(process.env.DB_SEMAPHORE_LIMIT || '8', 10)
);

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
 * Execute a database operation with connection semaphore and retry logic
 * This ensures we don't overwhelm the connection pool during static generation
 * 
 * The semaphore limits concurrent operations, and retry logic handles transient failures
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 5,
  baseDelayMs: number = 2000
): Promise<T> {
  // Acquire semaphore permit before attempting operation
  await dbSemaphore.acquire();
  
  try {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await operation();
        return result;
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
  } finally {
    // Always release semaphore permit, even on error
    dbSemaphore.release();
  }
}

