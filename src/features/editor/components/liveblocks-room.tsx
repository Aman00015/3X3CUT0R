"use client";

import { ReactNode } from "react";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import { EditorLoading } from "./editor";

export function LiveblocksRoom({
  workflowId,
  children,
}: {
  workflowId: string;
  children: ReactNode;
}) {
  return (
    <LiveblocksProvider 
      authEndpoint="/api/liveblocks-auth"
      resolveUsers={async ({ userIds }) => {
        try {
          const res = await fetch(`/api/liveblocks-users?ids=${encodeURIComponent(userIds.join(","))}`);
          if (!res.ok) return [];
          return await res.json();
        } catch {
          return [];
        }
      }}
    >
      {/* Each workflow gets its own isolated room */}
      <RoomProvider id={`workflow-${workflowId}`}>
        <ClientSideSuspense fallback={<EditorLoading />}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}