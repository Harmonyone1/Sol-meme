import { PrismaClient } from '@prisma/client';

// Reuse PrismaClient in dev to avoid connection storm on HMR
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export type { Prisma, Strategy, Candidate, Trade, Position, Integration, Alert } from '@prisma/client';

