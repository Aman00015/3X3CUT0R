"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { GeminiChatDialog, type GeminiChatFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchGeminiChatRealtimeToken } from "./actions";
import { GEMINI_CHAT_CHANNEL_NAME } from "@/inngest/channels/gemini-chat";

type GeminiChatNodeData = {
  variableName?: string;
  systemPrompt?: string;
  userMessage?: string;
};

type GeminiChatNodeType = Node<GeminiChatNodeData>;

export const GeminiChatNode = memo((props: NodeProps<GeminiChatNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GEMINI_CHAT_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGeminiChatRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: GeminiChatFormValues) => {
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
  const description = nodeData?.userMessage
    ? "Configured"
    : "Not configured";

  return (
    <>
      <GeminiChatDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/gemini.svg"
        name="Gemini Chat"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

GeminiChatNode.displayName = "GeminiChatNode";
