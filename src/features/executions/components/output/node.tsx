"use client";

import { memo } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { OUTPUT_CHANNEL_NAME } from "@/inngest/channels/output";
import { fetchOutputRealtimeToken } from "./actions";
import { type Node, type NodeProps } from "@xyflow/react";
import { FileTextIcon } from "lucide-react";
import { toStructuredNodeOutput, outputPreview } from "@/features/executions/lib/structured-output";
import { BaseExecutionNode } from "../base-execution-node";

type OutputNodeData = {
  previewContent?: unknown;
};

type OutputNodeType = Node<OutputNodeData>;

export const OutputNode = memo((props: NodeProps<OutputNodeType>) => {
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: OUTPUT_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchOutputRealtimeToken,
  });

  const preview = outputPreview(
    toStructuredNodeOutput(
      props.data?.previewContent ?? "Double-click to open the latest execution output viewer.",
    ),
    60,
  );

  return (
    <BaseExecutionNode
      {...props}
      id={props.id}
      icon={FileTextIcon}
      name="Output"
      status={nodeStatus}
      description={preview}
    />
  );
});

OutputNode.displayName = "OutputNode";
