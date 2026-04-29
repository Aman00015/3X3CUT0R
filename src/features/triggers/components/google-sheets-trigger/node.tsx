"use client";

import { type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { GoogleSheetsTriggerDialog } from "./dialog";

export const GoogleSheetsTriggerNode = memo((props: NodeProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenSettings = () => setDialogOpen(true);

  return (
    <>
      <GoogleSheetsTriggerDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <BaseTriggerNode
        {...props}
        icon="/logos/google.svg"
        name="Google Sheets"
        description="When a new row is added"
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
});

GoogleSheetsTriggerNode.displayName = "GoogleSheetsTriggerNode";
