import { NodeProps } from "@xyflow/react";
import { memo } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";

export const manualTriggerNode = memo((props: NodeProps) => {
  return (
    <>
      <BaseTriggerNode
        {...props}
        icon={MousePointerIcon}
        name="When Clicking 'Execute Workflow'"
        // onSetting={handleOpenSettings}
        // onDoubleClick={handleOpenSettings}
      />
    </>
  );
});
