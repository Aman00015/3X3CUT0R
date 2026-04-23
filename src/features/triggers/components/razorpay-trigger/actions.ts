"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { razorpayTriggerChannel } from "@/inngest/channels/razorpay-trigger";
import { inngest } from "@/inngest/client";

export type RazorpayTriggerToken = Realtime.Token<
  typeof razorpayTriggerChannel,
  ["status"]
>;

export async function fetchRazorpayTriggerRealtimeToken(): Promise<RazorpayTriggerToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: razorpayTriggerChannel(),
    topics: ["status"],
  });

  return token;
}
