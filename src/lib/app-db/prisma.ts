// -----------------------------------------------------
//  Prisma Client Singleton
// -----------------------------------------------------
//  Prevents connection pool exhaustion during Next.js development
//  by reusing a single Prisma instance across hot-reloads.
//
//  The issue: In dev mode, Next.js rebuilds the server on each save,
//  but the Node process persists. Without this pattern, each reload
//  would create a new PrismaClient with its own connection pool,
//  eventually causing "Too many connections" errors.
//
//  The solution: Store a single instance on the global object in dev,
//  but create a fresh client for each request in production.
// -----------------------------------------------------

import { PrismaClient } from '@prisma/client'

// Add prisma to the NodeJS global type
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Use existing client from global scope or create a new one
export const prisma = 
  global.prisma ?? new PrismaClient({ log: ['error'] })

// Cache the client in development only
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}