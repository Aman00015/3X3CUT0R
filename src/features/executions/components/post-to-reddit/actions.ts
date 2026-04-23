"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { postToRedditChannel } from "@/inngest/channels/post-to-reddit";
import { inngest } from "@/inngest/client";

export type PostToRedditToken = Realtime.Token<
  typeof postToRedditChannel,
  ["status"]
>;

export async function fetchPostToRedditRealtimeToken(): Promise<PostToRedditToken> {
  return await getSubscriptionToken(inngest, {
    channel: postToRedditChannel(),
    topics: ["status"],
  });
}
