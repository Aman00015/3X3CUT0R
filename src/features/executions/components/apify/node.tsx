"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { ApifyDialog, type ApifyFormValues } from "./dialog";
import { Search } from "lucide-react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchApifyRealtimeToken } from "./actions";
import { APIFY_CHANNEL_NAME } from "@/inngest/channels/apify";

type ApifyData = {
  variableName?: string;
  credentialId?: string;
  searchQuery?: string;
  maxResults?: number;
};

type ApifyNodeType = Node<ApifyData>;

export const ApifyNode = memo((props: NodeProps<ApifyNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: APIFY_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchApifyRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: ApifyFormValues) => {
    setNodes((nodes) => nodes.map((node) => {
      if (node.id === props.id) {
        return {
          ...node,
          data: {
            ...node.data,
            ...values,
          }
        }
      }
      return node;
    }))
  };

  const nodeData = props.data;
  const description = nodeData?.searchQuery
    ? `Query: ${nodeData.searchQuery.slice(0, 40)}${nodeData.searchQuery.length > 40 ? '...' : ''}`
    : "Extract leads using Apify";

  return (
    <>
      <ApifyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={Search}
        name="Apify Maps"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        className=""
      />
    </>
  )
});

ApifyNode.displayName = "ApifyNode";
