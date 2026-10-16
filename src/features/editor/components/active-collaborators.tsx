"use client";

import { useOthers, useSelf } from "@liveblocks/react/suspense";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const USER_COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#059669",
];

function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

export function ActiveCollaborators() {
  const others = useOthers();
  const self = useSelf();

  const totalCollaborators = others.length + (self ? 1 : 0);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-2">
        {/* Live connection dot */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{totalCollaborators} online</span>
        </div>

        {/* Avatar Stack */}
        <div className="flex items-center -space-x-2 overflow-hidden">
          {/* Current user */}
          {self && (
            <Tooltip key="self">
              <TooltipTrigger asChild>
                <div
                  className="rounded-full ring-2 ring-background cursor-pointer hover:z-10 transition-transform hover:scale-105"
                  style={{
                    boxShadow: `0 0 0 2px ${colorForId(String(self.id ?? self.connectionId))}`,
                  }}
                >
                  <Avatar className="h-7 w-7 text-xs">
                    <AvatarImage
                      src={
                        (self.info as { avatar?: string })?.avatar || undefined
                      }
                    />
                    <AvatarFallback className="font-semibold text-[10px]">
                      {(
                        (self.info as { name?: string })?.name?.[0] ?? "Y"
                      ).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p className="font-medium">
                  {(self.info as { name?: string })?.name ?? "You"} (You)
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Other users */}
          {others.map((other) => {
            const info = other.info as
              | { name?: string; avatar?: string }
              | undefined;
            const name = info?.name ?? "Anonymous";
            const avatar = info?.avatar;
            const color = colorForId(String(other.id || other.connectionId));

            return (
              <Tooltip key={other.connectionId}>
                <TooltipTrigger asChild>
                  <div
                    className="rounded-full ring-2 ring-background cursor-pointer hover:z-10 transition-transform hover:scale-105"
                    style={{
                      boxShadow: `0 0 0 2px ${color}`,
                    }}
                  >
                    <Avatar className="h-7 w-7 text-xs">
                      <AvatarImage src={avatar || undefined} />
                      <AvatarFallback className="font-semibold text-[10px]">
                        {(name[0] ?? "?").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p className="font-medium">{name}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
