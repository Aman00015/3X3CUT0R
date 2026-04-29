import { channel, topic } from "@inngest/realtime";

export const APIFY_CHANNEL_NAME = "apify-execution";

export const apifyChannel = channel(APIFY_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
