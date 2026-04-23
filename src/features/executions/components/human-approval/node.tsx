"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { HumanApprovalDialog, type HumanApprovalFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchHumanApprovalRealtimeToken } from "./actions";
import { HUMAN_APPROVAL_CHANNEL_NAME } from "@/inngest/channels/human-approval";

type HumanApprovalNodeData = {
  approverEmail?: string;
  timeoutHours?: string;
  previewContent?: string;
};

type HumanApprovalNodeType = Node<HumanApprovalNodeData>;

export const HumanApprovalNode = memo((props: NodeProps<HumanApprovalNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: HUMAN_APPROVAL_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchHumanApprovalRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: HumanApprovalFormValues) => {
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
  const description = nodeData?.approverEmail
    ? `Approver: ${nodeData.approverEmail}`
    : "Not configured";

  return (
    <>
      <HumanApprovalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/logo.svg"
        name="Human Approval"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

HumanApprovalNode.displayName = "HumanApprovalNode";
