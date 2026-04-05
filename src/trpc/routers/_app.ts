import { inngest } from "@/inngest/client";
import { createTRPCRouter, protectedProcedure } from "../init";
import prisma from "@/lib/db";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { TRPCError } from "@trpc/server";

export const appRouter = createTRPCRouter({
  testAi: protectedProcedure.mutation(async () => {

    await inngest.send({
      name: "execute/ai",
    });
    return { success: true, message: "job queued" };
  }),

  getWorkflows: protectedProcedure.query(({ ctx }) => {
    return prisma.workflow.findMany();
  }),

  createWorkflow: protectedProcedure.mutation(async () => {
    await inngest.send({
      name: "app/task.created",
      data: {
        id: "task-001",
      },
    });
    return { success: true, message: "job queued" };
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
