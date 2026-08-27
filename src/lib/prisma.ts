import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl() {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    try {
      const tmpDbPath = '/tmp/dev.db';
      if (!fs.existsSync(tmpDbPath)) {
        const srcDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
        if (fs.existsSync(srcDbPath)) {
          fs.copyFileSync(srcDbPath, tmpDbPath);
        }
      }
      return `file:${tmpDbPath}`;
    } catch (e) {
      console.error('Failed to prepare SQLite database in /tmp:', e);
    }
  }
  return process.env.DATABASE_URL || 'file:./dev.db';
}

const dbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
