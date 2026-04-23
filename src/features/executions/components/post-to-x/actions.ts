"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { postToXChannel } from "@/inngest/channels/post-to-x";
import { inngest } from "@/inngest/client";

export type PostToXToken = Realtime.Token<
  typeof postToXChannel,
  ["status"]
>;

export async function fetchPostToXRealtimeToken(): Promise<PostToXToken> {
  return await getSubscriptionToken(inngest, {
    channel: postToXChannel(),
    topics: ["status"],
  });
}
