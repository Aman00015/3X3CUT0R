import { channel, topic } from "@inngest/realtime";

export const GEMINI_CHAT_CHANNEL_NAME = "gemini-chat-execution";

export const geminiChatChannel = channel(GEMINI_CHAT_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
