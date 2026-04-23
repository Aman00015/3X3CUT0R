"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { PostToXDialog, type PostToXFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchPostToXRealtimeToken } from "./actions";
import { POST_TO_X_CHANNEL_NAME } from "@/inngest/channels/post-to-x";

type PostToXNodeData = {
  credentialId?: string;
  content?: string;
};

type PostToXNodeType = Node<PostToXNodeData>;

export const PostToXNode = memo((props: NodeProps<PostToXNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: POST_TO_X_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchPostToXRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: PostToXFormValues) => {
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
  const description = nodeData?.credentialId
    ? "Configured"
    : "Not configured";

  return (
    <>
      <PostToXDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/x.svg"
        name="Post to X"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

PostToXNode.displayName = "PostToXNode";
