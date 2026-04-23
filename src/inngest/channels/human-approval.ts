import { channel, topic } from "@inngest/realtime";

export const HUMAN_APPROVAL_CHANNEL_NAME = "human-approval-execution";

export const humanApprovalChannel = channel(HUMAN_APPROVAL_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
