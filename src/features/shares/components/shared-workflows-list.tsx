"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, Users2Icon } from "lucide-react";
import { LoadingView, ErrorView } from "@/components/entity-components";

export const SharedWorkflowsList = () => {
  const trpc = useTRPC();
  const { data: shared, isLoading, isError } = useQuery(
    trpc.workflows.getShared.queryOptions(),
  );

  if (isLoading) return <LoadingView message="Loading shared workflows..." />;
  if (isError) return <ErrorView message="Error loading shared workflows" />;

  if (!shared || shared.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="rounded-full bg-muted p-5">
          <Users2Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-lg">No shared workflows yet</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            When someone shares a workflow with you, it will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {shared.map((workflow) => (
        <div
          key={workflow.id}
          className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors group"
        >
          {/* Owner avatar */}
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={workflow.user.image ?? undefined} />
            <AvatarFallback>
              {workflow.user.name?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>

          {/* Workflow info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{workflow.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              Shared by{" "}
              <span className="text-foreground">{workflow.user.name ?? workflow.user.email}</span>
              {" · "}
              {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
            </p>
          </div>

          {/* Role badge */}
          <Badge
            variant={workflow.role === "EDITOR" ? "default" : "secondary"}
            className="shrink-0 text-xs"
          >
            {workflow.role === "EDITOR" ? "Editor" : "Viewer"}
          </Badge>

          {/* Open button */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Link href={`/workflows/${workflow.id}`}>
              Open
              <ArrowRightIcon className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      ))}
    </div>
  );
};
