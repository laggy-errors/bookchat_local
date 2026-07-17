import { PrismaClient } from '@prisma/client';
import { config } from '../config';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

console.log('[Prisma Init] Active DATABASE_URL environment:', process.env.DATABASE_URL);
console.log('[Prisma Init] Configured databaseUrl:', config.databaseUrl);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: 'file:/tmp/dev.db',
      },
    },
    log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (config.nodeEnv !== 'production') globalForPrisma.prisma = prisma;

