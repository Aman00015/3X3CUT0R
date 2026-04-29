"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { GoogleSheetsActionDialog, type GoogleSheetsActionFormValues } from "./dialog";
import { LayoutGrid } from "lucide-react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { fetchGoogleSheetsRealtimeToken } from "./actions";
import { GOOGLE_SHEETS_ACTION_CHANNEL_NAME } from "@/inngest/channels/google-sheets-action";

type GoogleSheetsData = {
  credentialId?: string;
  spreadsheetId?: string;
  sheetName?: string;
  dataToAppend?: string;
};

type GoogleSheetsNodeType = Node<GoogleSheetsData>;

export const GoogleSheetsActionNode = memo((props: NodeProps<GoogleSheetsNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: GOOGLE_SHEETS_ACTION_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchGoogleSheetsRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: GoogleSheetsActionFormValues) => {
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
  const description = nodeData?.spreadsheetId
    ? `Sheet ID: ${nodeData.spreadsheetId.slice(0, 20)}...`
    : "Add rows to Google Sheets";

  return (
    <>
      <GoogleSheetsActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={LayoutGrid}
        name="Google Sheets"
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        className=""
      />
    </>
  )
});

GoogleSheetsActionNode.displayName = "GoogleSheetsActionNode";
