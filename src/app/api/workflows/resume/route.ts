import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const executionId = searchParams.get("executionId");
  const decision = searchParams.get("decision");

  if (!executionId || !decision) {
    return NextResponse.json({ error: "Missing executionId or decision" }, { status: 400 });
  }

  try {
    await inngest.send({
      name: "workflow/approval.received",
      data: { executionId, decision },
    });

    const isApproved = decision === "approve";
    const bgColor = isApproved ? "#10b981" : "#ef4444";
    const message = isApproved ? "Workflow Approved!" : "Workflow Rejected!";

    return new NextResponse(
      `
      <html>
        <head>
          <title>Approval Status</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f3f4f6; }
            .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; border-top: 6px solid ${bgColor}; }
            h1 { color: #111827; margin-bottom: 1rem; }
            p { color: #4b5563; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${message}</h1>
            <p>You can now close this window. The workflow execution will continue.</p>
          </div>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("Failed to send approval event", error);
    return NextResponse.json({ error: "Failed to resume workflow" }, { status: 500 });
  }
}
