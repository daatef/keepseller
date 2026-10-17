import { PrismaClient } from "@prisma/client";

declare global {
  // Avoid re-creating PrismaClient in development
  var prisma: PrismaClient | undefined;
}

// Create shared PrismaClient instance (for the `public` schema only)
export const db =
  globalThis.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
