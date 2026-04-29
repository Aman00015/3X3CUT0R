import { NodeExecutor } from "@/features/executions/types";

export const googleSheetsTriggerExecutor: NodeExecutor = async ({
  context,
}) => {
  // Triggers just pass the context forward
  return context;
};
