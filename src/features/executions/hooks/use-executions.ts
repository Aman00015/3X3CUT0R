import { useTRPC } from "@/trpc/client"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useExecutionsParams } from "./use-executions-params";

/**
 * Hook to fetch all executions using suspense
 */
export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();
  
  return useSuspenseQuery(trpc.executions.getMany.queryOptions(params));
};

/**
 * Hook to fetch a single execution using suspense
 */
export const useSuspenseExecution = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
};

export const useLatestExecutionByWorkflow = (
  workflowId: string,
  enabled = true,
) => {
  const trpc = useTRPC();

  return useQuery({
    ...trpc.executions.getLatestByWorkflow.queryOptions({ workflowId }),
    enabled: enabled && Boolean(workflowId),
    retry: false,
    refetchInterval: enabled ? 3000 : false,
  });
};

