import { channel, topic } from "@inngest/realtime";

export const OUTPUT_CHANNEL_NAME = "output-execution";

export const outputChannel = channel(OUTPUT_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      nodeId: string;
      status: "loading" | "success" | "error";
    }>(),
  );
