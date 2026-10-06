import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  // 1. Authenticate the user via Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { user } = session;

  // 2. Extract which room (workflow) the client is trying to join
  //    Liveblocks sends { room } in the request body
  const body = await request.json().catch(() => ({}));
  const roomId: string | undefined = body?.room;

  // 3. Check DB access if a roomId is present (format: "workflow-{workflowId}")
  let isReadOnly = false;
  if (roomId?.startsWith("workflow-")) {
    const workflowId = roomId.replace("workflow-", "");

    // Check if user is the owner
    const ownedWorkflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId: user.id },
    });

    if (!ownedWorkflow) {
      // Check for a share grant
      const share = await prisma.workflowShare.findUnique({
        where: { workflowId_userId: { workflowId, userId: user.id } },
      });

      if (!share) {
        return new Response("Forbidden: no access to this workflow", {
          status: 403,
        });
      }

      // Viewers get read-only access
      isReadOnly = share.role === "VIEWER";
    }
  }

  // 4. Create the Liveblocks session with real user identity
  const lb_session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name: user.name ?? "Anonymous",
      avatar: user.image ?? "",
    },
  });

  if (roomId) {
    lb_session.allow(
      roomId,
      isReadOnly ? lb_session.READ_ACCESS : lb_session.FULL_ACCESS,
    );
  } else {
    // Fallback: allow all rooms (shouldn't normally hit this)
    lb_session.allow("*", lb_session.FULL_ACCESS);
  }

  const { status, body: responseBody } = await lb_session.authorize();
  return new Response(responseBody, { status });
}