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
  const preview = interpolate(data.previewContent || "Please approve this workflow step.", context);

  const resendApiKey = process.env.RESEND_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!resendApiKey) {
    await publish(humanApprovalChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Human Approval: RESEND_API_KEY is not set for sending emails");
  }

  const approveUrl = `${appUrl}/api/workflows/resume?executionId=${executionId}&decision=approve`;
  const rejectUrl = `${appUrl}/api/workflows/resume?executionId=${executionId}&decision=reject`;

  const displayContent = preview.trim() || "<em>(No preview content provided)</em>";

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f8fafc; padding: 24px; border-bottom: 1px solid #e4e4e7;">
        <h2 style="margin: 0; color: #0f172a;">Workflow Approval Required</h2>
        <p style="margin: 8px 0 0 0; color: #64748b;">A workflow execution is paused and waiting for your decision.</p>
      </div>
      
      <div style="padding: 24px;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">Review Content</h3>
        <div style="background: #f1f5f9; padding: 16px; border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 14px; line-height: 1.5; color: #334155; white-space: pre-wrap;">${displayContent}</div>
        
        <div style="margin-top: 24px; display: flex; gap: 12px;">
          <a href="${approveUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Approve & Continue</a>
          <a href="${rejectUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin-left: 10px;">Reject Workflow</a>
        </div>
      </div>
      
      <div style="background-color: #f8fafc; padding: 16px; border-top: 1px solid #e4e4e7; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">Execution ID: ${executionId}</p>
      </div>
    </div>
  `;

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
