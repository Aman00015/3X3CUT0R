import { channel, topic } from "@inngest/realtime";

export const POST_TO_X_CHANNEL_NAME = "post-to-x-execution";

export const postToXChannel = channel(POST_TO_X_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
