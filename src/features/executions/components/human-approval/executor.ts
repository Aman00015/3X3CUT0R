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

  const htmlBody = `
    <h2>Workflow Approval Required</h2>
    <p>A workflow requires your approval to proceed.</p>
    <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; font-family: monospace; margin: 16px 0;">
      ${preview.replace(/\n/g, "<br/>")}
    </div>
    <p>
      <a href="${approveUrl}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">Approve</a>
      <a href="${rejectUrl}" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Reject</a>
    </p>
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
      if: `async.data.executionId == '${executionId}'`,
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
