"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { geminiChatChannel } from "@/inngest/channels/gemini-chat";
import { inngest } from "@/inngest/client";

export type GeminiChatToken = Realtime.Token<
  typeof geminiChatChannel,
  ["status"]
>;

export async function fetchGeminiChatRealtimeToken(): Promise<GeminiChatToken> {
  return await getSubscriptionToken(inngest, {
    channel: geminiChatChannel(),
    topics: ["status"],
  });
}
