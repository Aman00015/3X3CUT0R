import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Users2Icon } from "lucide-react";
import { SharedWorkflowsList } from "@/features/shares/components/shared-workflows-list";

const Page = async () => {
  await requireAuth();

  return (
    <HydrateClient>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b px-6 py-5 flex items-center gap-3">
          <div className="rounded-lg bg-muted p-2">
            <Users2Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Shared with me</h1>
            <p className="text-sm text-muted-foreground">
              Workflows other users have given you access to
            </p>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto">
          <SharedWorkflowsList />
        </div>
      </div>
    </HydrateClient>
  );
};

export default Page;
