import { PrismaClient } from "@prisma/client";

declare global {
  var __aitodayPrisma: PrismaClient | undefined;
}

export function getPrismaClient() {
  if (!globalThis.__aitodayPrisma) {
    globalThis.__aitodayPrisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  return globalThis.__aitodayPrisma;
}
