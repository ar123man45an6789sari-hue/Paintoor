/* Prisma client singleton — one pool per server instance, cached on
   globalThis so Next dev hot-reload never opens extra pools (free-tier cap). */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;