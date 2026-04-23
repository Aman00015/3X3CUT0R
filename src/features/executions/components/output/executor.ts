import type { NodeExecutor } from "@/features/executions/types";
import { toStructuredNodeOutput, type StructuredNodeOutput } from "@/features/executions/lib/structured-output";
import { outputChannel } from "@/inngest/channels/output";

type OutputNodeData = {
  sourceKey?: string;
};

type OutputNodeRegistry = Record<string, StructuredNodeOutput>;

const isStructuredOutputLike = (value: unknown): value is StructuredNodeOutput => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as { type?: unknown; content?: unknown };
  return (
    (candidate.type === "json" || candidate.type === "markdown" || candidate.type === "text")
    && "content" in candidate
  );
};

const getLatestContextValue = (context: Record<string, unknown>): unknown => {
  const entries = Object.entries(context)
    .filter(([key]) => key !== "__outputNodes")
    .reverse();

  const latestStructured = entries.find(([, value]) => isStructuredOutputLike(value));
  if (latestStructured) {
    return latestStructured[1];
  }

  const latestNonEmpty = entries.find(([, value]) => value !== undefined && value !== null);
  if (latestNonEmpty) {
    return latestNonEmpty[1];
  }

  return context;
};

const getSourceValue = (context: Record<string, unknown>, sourceKey?: string) => {
  if (!sourceKey) {
    return getLatestContextValue(context);
  }

  return context[sourceKey];
};

const getOutputRegistry = (context: Record<string, unknown>): OutputNodeRegistry => {
  const candidate = context.__outputNodes;

  if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
    return candidate as OutputNodeRegistry;
  }

  return {};
};

export const outputExecutor: NodeExecutor<OutputNodeData> = async ({
  data,
  nodeId,
  context,
  publish,
}) => {
  await publish(
    outputChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  try {
    const source = getSourceValue(context, data.sourceKey);
    const output = toStructuredNodeOutput(source, {
      timestamp: new Date().toISOString(),
    });

    const outputRegistry = getOutputRegistry(context);

    await publish(
      outputChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      __outputNodes: {
        ...outputRegistry,
        [nodeId]: output,
      },
    };
  } catch (error) {
    await publish(
      outputChannel().status({
        nodeId,
        status: "error",
      }),
    );

    throw error;
  }
};
