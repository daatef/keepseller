// lib/prisma.ts

import { PrismaClient } from "@prisma/client";

// Define a global type for development-time hot reload caching
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Create a single Prisma client instance
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Optional: Uncomment if you want to log all Prisma queries in dev
    // log: ["query", "info", "warn", "error"],
  });

// Cache the instance in development to avoid re-instantiating on hot reload
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };
