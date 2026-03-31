// lib/db.ts
// This file creates and exports a single Prisma database connection
// that is reused across your entire Next.js app

// Import the auto-generated PrismaClient from your schema
// This client has full TypeScript types for all your models (User, Post, etc.)
import { PrismaClient } from "@/generated/prisma";

// In Next.js development, the server reloads on every file change (Hot Reload)
// Each reload would normally create a NEW database connection → connection limit exceeded
// To prevent this, we store the Prisma instance on the `global` object
// which persists across hot reloads
// This line tells TypeScript that `global` can have a `prisma` property
const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// If a Prisma instance already exists on global (from a previous hot reload), reuse it
// Otherwise create a brand new PrismaClient connection
// This ensures only ONE connection exists at a time during development
const prisma = globalForPrisma.prisma || new PrismaClient();

// Only store the instance on `global` in development
// In production (Vercel, etc.) this is unnecessary because the server
// never hot reloads — each request gets a fresh serverless function instance
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Export the single shared Prisma instance
// Use this in your API routes, server actions, etc. like:
//   import prisma from "@/lib/db"
//   const users = await prisma.user.findMany()
export default prisma;