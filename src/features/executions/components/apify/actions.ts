"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { apifyChannel } from "@/inngest/channels/apify";
import { inngest } from "@/inngest/client";

export type ApifyToken = Realtime.Token<
  typeof apifyChannel,
  ["status"]
>;

export async function fetchApifyRealtimeToken(): Promise<ApifyToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: apifyChannel(),
    topics: ["status"],
  });

  return token;
};
