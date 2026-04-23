import { channel, topic } from "@inngest/realtime";

export const POST_TO_REDDIT_CHANNEL_NAME = "post-to-reddit-execution";

export const postToRedditChannel = channel(POST_TO_REDDIT_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
