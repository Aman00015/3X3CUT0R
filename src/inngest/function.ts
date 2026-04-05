// src/inngest/functions.ts
import prisma from "@/lib/db";
import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();

export const execute = inngest.createFunction(
  { id: "execute-ai", triggers: { event: "execute/ai" } },
  async ({ event, step }) => {

    const { steps: geminiSteps } = await step.ai.wrap(
      "gemini-generate-text",
      generateText,
      {
        model: google("gemini-2.5-flash"),
        system: "you are a math expert",
        prompt: "2+2=",
        experimental_telemetry: {
          isEnabled: true,
          functionId: "joke_agent",
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    // const { steps: openaiSteps } = await step.ai.wrap(
    //   "openai-generate-text",
    //   generateText,
    //   {
    //     model: openai("gpt-4.1-mini"),
    //     system: "you are a math expert",
    //     prompt: "2+2=",
    //     experimental_telemetry: {
    //       isEnabled: true,
    //       functionId: "joke_agent",
    //       recordInputs: true,
    //       recordOutputs: true,
    //     },
    //   },
    // );
    // const { steps: anthropicSteps } = await step.ai.wrap(
    //   "anthropic-generate-text",
    //   generateText,
    //   {
    //     model: anthropic("claude-sonnet-4-5"),
    //     system: "you are a math expert",
    //     prompt: "2+2=",
    //     experimental_telemetry: {
    //       isEnabled: true,
    //       functionId: "joke_agent",
    //       recordInputs: true,
    //       recordOutputs: true,
    //     },
    //   },
    // );

    return {
      geminiSteps,
      // openaiSteps,
      // anthropicSteps,
    };
  },
);
