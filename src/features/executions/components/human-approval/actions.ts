"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { humanApprovalChannel } from "@/inngest/channels/human-approval";
import { inngest } from "@/inngest/client";

export type HumanApprovalToken = Realtime.Token<
  typeof humanApprovalChannel,
  ["status"]
>;

export async function fetchHumanApprovalRealtimeToken(): Promise<HumanApprovalToken> {
  return await getSubscriptionToken(inngest, {
    channel: humanApprovalChannel(),
    topics: ["status"],
  });
}
