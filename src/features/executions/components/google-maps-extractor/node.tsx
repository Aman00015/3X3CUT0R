"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { GoogleMapsExtractorDialog, type GoogleMapsExtractorFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchGoogleMapsExtractorRealtimeToken } from "./actions";
import { GOOGLE_MAPS_EXTRACTOR_CHANNEL_NAME } from "@/inngest/channels/google-maps-extractor";
import { MapPin } from "lucide-react";

type GoogleMapsExtractorData = {
  variableName?: string;
  credentialId?: string;
  searchQuery?: string;
  maxLeads?: number;
};

type GoogleMapsExtractorNodeType = Node<GoogleMapsExtractorData>;

export const GoogleMapsExtractorNode = memo((props: NodeProps<GoogleMapsExtractorNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GOOGLE_MAPS_EXTRACTOR_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGoogleMapsExtractorRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: GoogleMapsExtractorFormValues) => {
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
    : "Extract leads from Google Maps";

  return (
    <>
      <GoogleMapsExtractorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={MapPin}
        name="Maps Extractor"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        className="border-green-500/50"
      />
    </>
  )
});

GoogleMapsExtractorNode.displayName = "GoogleMapsExtractorNode";
