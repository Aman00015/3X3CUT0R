"use client";

import { requireAuth } from "@/lib/auth-utils";
import { Logout } from "./logout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export default function Page() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());
  const testAI = useMutation(
    trpc.testAi.mutationOptions({
      onSuccess: () => {
        toast.success("AI job queued");
      },
    }),
  );

  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        toast.success("Job Queued");
      },
    }),
  );

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center text-black">
      <div>
        {JSON.stringify(data, null, 2)}
        <Button disabled={create.isPending} onClick={() => create.mutate()}>
          Create Workflow
        </Button>
        <div>
          <Button disabled={testAI.isPending} onClick={() => testAI.mutate()}>
            test AI
          </Button>
        </div>
      </div>
      <Logout />
    </div>
  );
}
