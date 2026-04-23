"use client";

import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { RazorpayTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { fetchRazorpayTriggerRealtimeToken } from "./actions";
import { RAZORPAY_TRIGGER_CHANNEL_NAME } from "@/inngest/channels/razorpay-trigger";

export const RazorpayTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: RAZORPAY_TRIGGER_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchRazorpayTriggerRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  return (
    <>
      <RazorpayTriggerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <BaseTriggerNode
        {...props}
        icon="/logos/razorpay.png"
        name="Razorpay"
        description="When payment is captured"
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

RazorpayTriggerNode.displayName = "RazorpayTriggerNode";
