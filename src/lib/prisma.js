import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

/**
 * Cliente Prisma singleton para evitar múltiplas instâncias
 * durante o hot reload no desenvolvimento Next.js
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma