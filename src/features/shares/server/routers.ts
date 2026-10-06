import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { ShareRole } from "@/generated/prisma";
import z from "zod";

export const sharesRouter = createTRPCRouter({
  // Invite a user by email to a workflow
  invite: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        email: z.string().email(),
        role: z.nativeEnum(ShareRole).default(ShareRole.VIEWER),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Only the owner can invite
      const workflow = await prisma.workflow.findFirst({
        where: { id: input.workflowId, userId: ctx.auth.user.id },
      });

      if (!workflow) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the workflow owner can share it",
        });
      }

      // Find the invitee
      const invitee = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!invitee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No user found with that email address",
        });
      }

      if (invitee.id === ctx.auth.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot share a workflow with yourself",
        });
      }

      // Upsert so re-inviting changes the role
      return prisma.workflowShare.upsert({
        where: {
          workflowId_userId: {
            workflowId: input.workflowId,
            userId: invitee.id,
          },
        },
        create: {
          workflowId: input.workflowId,
          userId: invitee.id,
          role: input.role,
        },
        update: {
          role: input.role,
        },
        include: { user: true },
      });
    }),

  // Remove a user's access
  revoke: protectedProcedure
    .input(z.object({ workflowId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findFirst({
        where: { id: input.workflowId, userId: ctx.auth.user.id },
      });

      if (!workflow) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the workflow owner can revoke access",
        });
      }

      return prisma.workflowShare.delete({
        where: {
          workflowId_userId: {
            workflowId: input.workflowId,
            userId: input.userId,
          },
        },
      });
    }),

  // Update role of an existing share
  updateRole: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        userId: z.string(),
        role: z.nativeEnum(ShareRole),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findFirst({
        where: { id: input.workflowId, userId: ctx.auth.user.id },
      });

      if (!workflow) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not the owner" });
      }

      return prisma.workflowShare.update({
        where: {
          workflowId_userId: {
            workflowId: input.workflowId,
            userId: input.userId,
          },
        },
        data: { role: input.role },
        include: { user: true },
      });
    }),

  // List all shares for a workflow (owner only)
  list: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(async ({ ctx, input }) => {
      const workflow = await prisma.workflow.findFirst({
        where: { id: input.workflowId, userId: ctx.auth.user.id },
      });

      if (!workflow) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not the owner" });
      }

      return prisma.workflowShare.findMany({
        where: { workflowId: input.workflowId },
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
      });
    }),

  // Check if the current user has access (for shared users entering the editor)
  myAccess: protectedProcedure
    .input(z.object({ workflowId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Owner always has full access
      const owned = await prisma.workflow.findFirst({
        where: { id: input.workflowId, userId: ctx.auth.user.id },
      });
      if (owned) return { role: "OWNER" as const };

      const share = await prisma.workflowShare.findUnique({
        where: {
          workflowId_userId: {
            workflowId: input.workflowId,
            userId: ctx.auth.user.id,
          },
        },
      });

      if (!share) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No access" });
      }

      return { role: share.role };
    }),
});
