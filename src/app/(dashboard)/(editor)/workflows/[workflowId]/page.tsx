import { 
  Editor, 
  EditorError, 
  EditorLoading
} from "@/features/editor/components/editor";
import { LiveblocksRoom } from "@/features/editor/components/liveblocks-room";
import { EditorHeader } from "@/features/editor/components/editor-header";
import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface PageProps {
  params: Promise<{
    workflowId: string;
  }>
};

const Page = async ({ params }: PageProps) => {
  await requireAuth();

  const { workflowId } = await params;
  await prefetchWorkflow(workflowId);

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<EditorError />}>
        <Suspense fallback={<EditorLoading />}>
          <EditorHeader workflowId={workflowId} />
          <main className="flex-1">
            <LiveblocksRoom workflowId={workflowId}>
              <Editor workflowId={workflowId} />
            </LiveblocksRoom>
          </main>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  )
};

export default Page;
