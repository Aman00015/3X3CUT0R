"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { outputChannel } from "@/inngest/channels/output";
import { inngest } from "@/inngest/client";

export type OutputToken = Realtime.Token<
  typeof outputChannel,
  ["status"]
>;

export async function fetchOutputRealtimeToken(): Promise<OutputToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: outputChannel(),
    topics: ["status"],
  });

  return token;
}
