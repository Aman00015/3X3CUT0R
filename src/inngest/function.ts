// src/inngest/functions.ts
import prisma from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { NonRetriableError } from "inngest";
import { topologicalSort } from "./utils";
import { getExecutor } from "@/features/executions/lib/executor-registry";
import { NodeType } from "@/generated/prisma";

const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow", triggers: { event: "workflows/execute.workflow" } },
  async ({ event, step }) => {
    const workflowId = event.data.workflowId;
    if (!workflowId) {
      throw new NonRetriableError("Workflow Id is missing");
    }

    const sortedNodes = await step.run("prepare-workflow", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        },
      });
      return topologicalSort(workflow.nodes, workflow.connections);
    });
    let context = event.data.initialData || {};

    for(const node of sortedNodes){
      const executor = getExecutor(node.type as NodeType)
      context = await executor({
        data: node.data as Record<string,unknown>,
        nodeId: node.id,
        context,
        step
      })
    }

    return { sortedNodes };
  },
);
