import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { humanApprovalChannel } from "@/inngest/channels/human-approval";
import ky from "ky";

type HumanApprovalData = {
  approverEmail?: string;
  timeoutHours?: string;
  previewContent?: string;
};

function interpolate(template: string, context: Record<string, unknown>): string {
  const compiled = Handlebars.compile(template)(context);
  return decode(compiled);
}

export const humanApprovalExecutor: NodeExecutor<HumanApprovalData> = async ({
  data,
  nodeId,
  executionId,
  context,
  step,
  publish,
}) => {
  await publish(humanApprovalChannel().status({ nodeId, status: "loading" }));

  const approverEmail = interpolate(data.approverEmail || "", context);
  if (!approverEmail) {
    await publish(humanApprovalChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Human Approval: Approver Email is required");
  }

  const timeoutHours = parseInt(data.timeoutHours || "24", 10);

  // Handlebars silently drops unknown variables (e.g. {{gemini_chat.post_content}} when that
  // key doesn't exist in context). Show a clear fallback instead of the old confusing message.
  const rawPreview = interpolate(data.previewContent || "", context);
  const preview = rawPreview.trim()
    ? rawPreview.trim()
    : "(No preview content was provided, or the template variable returned empty.)";

  const resendApiKey = process.env.RESEND_API_KEY;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

  if (!resendApiKey) {
    await publish(humanApprovalChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Human Approval: RESEND_API_KEY is not set for sending emails");
  }

  const approveUrl = `${appUrl}/api/workflows/resume?executionId=${executionId}&decision=approve`;
  const rejectUrl = `${appUrl}/api/workflows/resume?executionId=${executionId}&decision=reject`;

  // Plain-text fallback — mobile clients that strip HTML still show clickable URLs
  const textBody = [
    "Workflow Approval Required",
    "",
    "A workflow execution is paused and waiting for your decision.",
    "",
    "--- Review Content ---",
    preview,
    "----------------------",
    "",
    `Approve & Continue: ${approveUrl}`,
    `Reject Workflow:    ${rejectUrl}`,
    "",
    `Execution ID: ${executionId}`,
  ].join("\n");

  // HTML email — table-based button layout required for mobile email clients.
  // Gmail on Android and Apple Mail on iOS strip display:flex/display:grid,
  // making flex-based buttons collapse or disappear. Tables are the only
  // reliable cross-client layout for email buttons.
  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Workflow Approval Required</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f4f6;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e4e4e7;border-radius:8px;">

          <!-- Header -->
          <tr>
            <td style="background-color:#f8fafc;padding:24px;border-bottom:1px solid #e4e4e7;border-radius:8px 8px 0 0;">
              <h2 style="margin:0;color:#0f172a;font-size:20px;font-weight:700;">Workflow Approval Required</h2>
              <p style="margin:8px 0 0 0;color:#64748b;font-size:14px;">A workflow execution is paused and waiting for your decision.</p>
            </td>
          </tr>

          <!-- Preview content -->
          <tr>
            <td style="padding:24px 24px 16px 24px;">
              <p style="margin:0 0 10px 0;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;font-weight:700;">Review Content</p>
              <div style="background:#f1f5f9;padding:16px;border-radius:6px;font-family:Courier New,Courier,monospace;font-size:13px;line-height:1.6;color:#334155;white-space:pre-wrap;word-break:break-word;">${preview}</div>
            </td>
          </tr>

          <!-- Buttons — each in its own table row for mobile safety -->
          <tr>
            <td style="padding:8px 24px 24px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom:12px;">
                    <a href="${approveUrl}"
                       style="display:block;background-color:#10b981;color:#ffffff;padding:14px 24px;text-decoration:none;border-radius:6px;font-weight:700;font-size:15px;text-align:center;line-height:1.2;">
                      &#10003; Approve &amp; Continue
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <a href="${rejectUrl}"
                       style="display:block;background-color:#ef4444;color:#ffffff;padding:14px 24px;text-decoration:none;border-radius:6px;font-weight:700;font-size:15px;text-align:center;line-height:1.2;">
                      &#10007; Reject Workflow
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:14px 24px;border-top:1px solid #e4e4e7;border-radius:0 0 8px 8px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">Execution ID: ${executionId}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await step.run(`send-approval-email-${nodeId}`, async () => {
      const response = await ky.post("https://api.resend.com/emails", {
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        json: {
          from: "onboarding@resend.dev",
          to: [approverEmail],
          subject: "Action Required: Workflow Approval",
          html: htmlBody,
          text: textBody,
        },
        throwHttpErrors: false,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new NonRetriableError(`Resend API Error ${response.status}: ${errorBody}`);
      }
    });

    const approval = await step.waitForEvent(`wait-human-approval-${nodeId}`, {
      event: "workflow/approval.received",
      timeout: `${timeoutHours}h`,
      if: `event.data.executionId == "${executionId}"`,
    });

    if (!approval) {
      throw new NonRetriableError("Approval timeout");
    }

    const decision = approval.data.decision;

    if (decision !== "approve") {
      throw new NonRetriableError("Workflow rejected by human approver");
    }

    await publish(humanApprovalChannel().status({ nodeId, status: "success" }));
    return {
      ...context,
      human_approval: {
        decision,
        approvedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    await publish(humanApprovalChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
