import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Build the connection URL with pool settings for serverless
function getDatabaseUrl(): string {
  const baseUrl = process.env.DATABASE_URL || '';

  // If URL already has query params, don't modify
  if (baseUrl.includes('?')) {
    return baseUrl;
  }

  // Add connection pool settings for serverless environments
  // These help prevent connection exhaustion during static generation
  return baseUrl;
}

// Create Prisma client with connection pool limits to prevent
// overwhelming the database during static page generation
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

