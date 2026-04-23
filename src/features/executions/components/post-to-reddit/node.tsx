"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { PostToRedditDialog, type PostToRedditFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchPostToRedditRealtimeToken } from "./actions";
import { POST_TO_REDDIT_CHANNEL_NAME } from "@/inngest/channels/post-to-reddit";

type PostToRedditNodeData = {
  credentialId?: string;
  subreddit?: string;
};

type PostToRedditNodeType = Node<PostToRedditNodeData>;

export const PostToRedditNode = memo((props: NodeProps<PostToRedditNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: POST_TO_REDDIT_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchPostToRedditRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: PostToRedditFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return { ...node, data: { ...node.data, ...values } };
        }
        return node;
      }),
    );
  };

  const description = props.data?.subreddit ? `r/${props.data.subreddit}` : "Not configured";

  return (
    <>
      <PostToRedditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={props.data}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon="/logos/reddit.png"
        name="Post to Reddit"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

PostToRedditNode.displayName = "PostToRedditNode";
