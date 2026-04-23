import { channel, topic } from "@inngest/realtime";

export const RAZORPAY_TRIGGER_CHANNEL_NAME = "razorpay-trigger-execution";

export const razorpayTriggerChannel = channel(RAZORPAY_TRIGGER_CHANNEL_NAME)
  .addTopic(
    topic("status").type<{
      nodeId: string;
      status: "loading" | "success" | "error";
    }>(),
  );
