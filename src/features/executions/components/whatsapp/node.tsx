"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { WhatsAppDialog, type WhatsAppFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchWhatsAppRealtimeToken } from "./actions";
import { WHATSAPP_CHANNEL_NAME } from "@/inngest/channels/whatsapp";

type WhatsAppNodeData = {
  variableName?: string;
  provider?: "twilio" | "meta";
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  phoneNumberId?: string;
  accessToken?: string;
  toPhone?: string;
  messageBody?: string;
};

type WhatsAppNodeType = Node<WhatsAppNodeData>;

export const WhatsAppNode = memo((props: NodeProps<WhatsAppNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: WHATSAPP_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchWhatsAppRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: WhatsAppFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return { ...node, data: { ...node.data, ...values } };
        }
        return node;
      }),
    );
  };

  const nodeData = props.data;
  const providerLabel = nodeData?.provider === "meta" ? "Meta" : "Twilio";
  const description = nodeData?.toPhone
    ? `${providerLabel} → ${nodeData.toPhone}`
    : nodeData?.provider
      ? `${providerLabel} — Not configured`
      : "Not configured";

  return (
    <>
      <WhatsAppDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/whatsapp.jpeg"
        name="WhatsApp"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

WhatsAppNode.displayName = "WhatsAppNode";
