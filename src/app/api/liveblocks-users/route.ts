import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

const USER_COLORS = [
  "#2563eb", // blue
  "#dc2626", // red
  "#16a34a", // green
  "#d97706", // amber
  "#7c3aed", // violet
  "#0891b2", // cyan
  "#db2777", // pink
  "#059669", // emerald
];

function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");
  if (!idsParam) {
    return NextResponse.json([]);
  }

  const userIds = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (userIds.length === 0) {
    return NextResponse.json([]);
  }

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  // Return array in same order as userIds
  const resolved = userIds.map((id) => {
    const user = userMap.get(id);
    return {
      name: user?.name ?? "Anonymous",
      avatar: user?.image ?? undefined,
      color: colorForId(id),
    };
  });

  return NextResponse.json(resolved);
}
