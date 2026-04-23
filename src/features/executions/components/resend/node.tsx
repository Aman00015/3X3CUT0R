"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { ResendDialog, type ResendFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchResendRealtimeToken } from "./actions";
import { RESEND_CHANNEL_NAME } from "@/inngest/channels/resend";

type ResendNodeData = {
  variableName?: string;
  apiKey?: string;
  fromEmail?: string;
  toEmail?: string;
  subject?: string;
  messageBody?: string;
};

type ResendNodeType = Node<ResendNodeData>;

export const ResendNode = memo((props: NodeProps<ResendNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: RESEND_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchResendRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: ResendFormValues) => {
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
  const description = nodeData?.toEmail
    ? `Email → ${nodeData.toEmail}`
    : "Not configured (fallback to trigger context)";

  return (
    <>
      <ResendDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/resend.png"
        name="Resend"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

ResendNode.displayName = "ResendNode";
