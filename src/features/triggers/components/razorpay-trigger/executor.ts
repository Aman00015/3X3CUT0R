import type { NodeExecutor } from "@/features/executions/types";
import { razorpayTriggerChannel } from "@/inngest/channels/razorpay-trigger";

type RazorpayTriggerData = Record<string, unknown>;

export const razorpayTriggerExecutor: NodeExecutor<RazorpayTriggerData> = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    razorpayTriggerChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  // The context already contains the parsed razorpay payload from the webhook
  const result = await step.run("razorpay-trigger", async () => context);

  await publish(
    razorpayTriggerChannel().status({
      nodeId,
      status: "success",
    }),
  );

  return result;
};
