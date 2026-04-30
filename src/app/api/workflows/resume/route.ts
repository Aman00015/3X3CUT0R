import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

function htmlPage(title: string, heading: string, message: string, color: string) {
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      padding: 20px;
    }
    .card {
      background: white;
      padding: 2.5rem 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
      text-align: center;
      border-top: 6px solid ${color};
      max-width: 420px;
      width: 100%;
    }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h1 { color: #111827; font-size: 1.5rem; margin-bottom: 0.75rem; }
    p { color: #4b5563; font-size: 1rem; line-height: 1.5; }
    .note { margin-top: 1.25rem; font-size: 0.85rem; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${color === "#10b981" ? "✅" : color === "#ef4444" ? "❌" : "⚠️"}</div>
    <h1>${heading}</h1>
    <p>${message}</p>
    <p class="note">You can safely close this window.</p>
  </div>
</body>
</html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const executionId = searchParams.get("executionId");
  const decision = searchParams.get("decision");

  console.log(`[RESUME_ROUTE] Called — executionId=${executionId}, decision=${decision}`);

  if (!executionId || !decision) {
    return htmlPage(
      "Invalid Request",
      "Invalid Approval Link",
      "This approval link is missing required parameters. Please contact the workflow administrator.",
      "#f59e0b"
    );
  }

  if (decision !== "approve" && decision !== "reject") {
    return htmlPage(
      "Invalid Decision",
      "Unknown Decision",
      `The decision "${decision}" is not recognized. Valid values are 'approve' or 'reject'.`,
      "#f59e0b"
    );
  }

  try {
    await inngest.send({
      name: "workflow/approval.received",
      data: {
        executionId: String(executionId),
        decision: String(decision),
      },
    });

    console.log(`[RESUME_ROUTE] ✅ Event sent — executionId=${executionId}, decision=${decision}`);

    const isApproved = decision === "approve";
    return htmlPage(
      isApproved ? "Workflow Approved" : "Workflow Rejected",
      isApproved ? "Workflow Approved!" : "Workflow Rejected",
      isApproved
        ? "Your approval has been recorded. The workflow will continue automatically."
        : "The workflow has been rejected and will stop.",
      isApproved ? "#10b981" : "#ef4444"
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[RESUME_ROUTE] ❌ Failed to send event:`, error);

    return htmlPage(
      "Approval Failed",
      "Something Went Wrong",
      `We could not record your decision. Please try again or contact support.<br><br><small style="color:#9ca3af">${errorMessage}</small>`,
      "#ef4444"
    );
  }
}
