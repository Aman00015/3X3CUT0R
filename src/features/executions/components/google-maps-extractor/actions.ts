"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { googleMapsExtractorChannel } from "@/inngest/channels/google-maps-extractor";
import { inngest } from "@/inngest/client";

export type GoogleMapsExtractorToken = Realtime.Token<
  typeof googleMapsExtractorChannel,
  ["status"]
>;

export async function fetchGoogleMapsExtractorRealtimeToken(): Promise<GoogleMapsExtractorToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: googleMapsExtractorChannel(),
    topics: ["status"],
  });

  return token;
}
