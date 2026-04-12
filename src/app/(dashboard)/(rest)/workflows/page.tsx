import { ErrorView } from "@/components/entity-components";
import {
  WorkflowsContainer,
  WorkflowsList,
  WorkflowsLoading,
} from "@/features/workflows/components/workflows";
import { prefetchWorkflows } from "@/features/workflows/prefetch";
import { workflowsParamsLoader } from "@/features/workflows/server/params-loader";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
  searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) => {
  await requireAuth();
  const params = await workflowsParamsLoader(searchParams);
  await prefetchWorkflows(params);
  return (
    <WorkflowsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<ErrorView />}>
          <Suspense fallback={<WorkflowsLoading />}>
            <WorkflowsList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  );
};

export default Page;
