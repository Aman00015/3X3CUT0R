import { channel, topic } from "@inngest/realtime";

export const GOOGLE_MAPS_EXTRACTOR_CHANNEL_NAME = "google-maps-extractor";

export const googleMapsExtractorChannel = channel(GOOGLE_MAPS_EXTRACTOR_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      nodeId: string;
      status: "loading" | "success" | "error";
    }>(),
  );
