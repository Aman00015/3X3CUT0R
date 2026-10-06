"use client";

import { useOthers } from "@liveblocks/react/suspense";
import { useViewport } from "@xyflow/react";

// Assign consistent colors per user id
const CURSOR_COLORS = [
  "#2563eb", "#dc2626", "#16a34a", "#d97706",
  "#7c3aed", "#0891b2", "#db2777", "#059669",
];

function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export function LiveCursors() {
  const others = useOthers();
  const { x: vpX, y: vpY, zoom } = useViewport();

  return (
    <>
      {others.map(({ connectionId, presence, info }) => {
        const cursor = (presence as { cursor?: { x: number; y: number } }).cursor;
        if (!cursor) return null;

        // Convert flow coordinates → screen coordinates
        const screenX = cursor.x * zoom + vpX;
        const screenY = cursor.y * zoom + vpY;
        const color = colorForId(String(connectionId));
        const name = (info as { name?: string })?.name ?? "Anonymous";

        return (
          <div
            key={connectionId}
            className="pointer-events-none absolute"
            style={{
              left: screenX,
              top: screenY,
              transform: "translate(-2px, -2px)",
              zIndex: 9999,
            }}
          >
            {/* Small cursor SVG — 16×20px */}
            <svg
              width="16"
              height="20"
              viewBox="0 0 16 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 0L0 14L4 10.5L7 16L9 15L6 9.5L11 9.5L0 0Z"
                fill={color}
                stroke="white"
                strokeWidth="1.2"
              />
            </svg>
            {/* Name label */}
            <div
              className="absolute left-3.5 top-3 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium text-white leading-none shadow-sm"
              style={{ backgroundColor: color }}
            >
              {name}
            </div>
          </div>
        );
      })}
    </>
  );
}
