import { Button } from "@/components/ui/button";
import { useExecuteWorkflow, useUpdateWorkflow } from "@/features/workflows/hooks/use-workflows";
import { useAtomValue } from "jotai";
import { FlaskConicalIcon } from "lucide-react";
import { editorAtom } from "../store/atoms";

export const ExecuteWorkflowButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const editor = useAtomValue(editorAtom);
  const saveWorkflow = useUpdateWorkflow();
  const executeWorkflow = useExecuteWorkflow();

  const handleExecute = async () => {
    if (!editor) {
      return;
    }

    const nodes = editor.getNodes();
    const edges = editor.getEdges();

    await saveWorkflow.mutateAsync({
      id: workflowId,
      nodes,
      edges,
    });

    await executeWorkflow.mutateAsync({ id: workflowId });
  };

  return (
    <Button
      size="lg"
      onClick={handleExecute}
      disabled={executeWorkflow.isPending || saveWorkflow.isPending}
    >
      <FlaskConicalIcon className="size-4" />
      Execute workflow
    </Button>
  );
};