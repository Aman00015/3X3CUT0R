import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { resendChannel } from "@/inngest/channels/resend";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

type ResendData = {
  variableName?: string;
  apiKey?: string;
  fromEmail?: string;
  toEmail?: string;
  subject?: string;
  messageBody?: string;
};

function interpolate(template: string, context: Record<string, unknown>): string {
  const compiled = Handlebars.compile(template)(context);
  return decode(compiled);
}

export const resendSendEmailExecutor: NodeExecutor<ResendData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(resendChannel().status({ nodeId, status: "loading" }));

  const apiKey = data.apiKey || process.env.RESEND_API_KEY;
  if (!apiKey) {
    await publish(resendChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Resend node: API key is required");
  }

  // To Email supports handlebars interpolation, fallback to razorpay payload
  const rawToEmail = data.toEmail ?? "";
  const toEmail = interpolate(rawToEmail, context) || String((context.razorpay as Record<string, unknown>)?.customer_email ?? "");

  if (!toEmail) {
    await publish(resendChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Resend node: toEmail is required");
  }

  const rawFromEmail = data.fromEmail ?? "onboarding@resend.dev";
  const fromEmail = interpolate(rawFromEmail, context);

  const rawSubject = data.subject ?? "Notification from Executor";
  const subject = interpolate(rawSubject, context);

  const rawMessageBody = data.messageBody ?? "";
  const messageBody = interpolate(rawMessageBody, context);

  if (!messageBody) {
    await publish(resendChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Resend node: messageBody is required");
  }

  try {
    const result = await step.run(`resend-send-${nodeId}`, async () => {
      const response = await ky.post("https://api.resend.com/emails", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        json: {
          from: fromEmail,
          to: [toEmail],
          subject,
          html: messageBody,
        },
        throwHttpErrors: false,
      });

      if (!response.ok) {
        const err = await response.json() as { message?: string };
        throw new NonRetriableError(
          `Resend error ${response.status}: ${err?.message ?? "Unknown error"}`,
        );
      }

      const resData = await response.json() as { id: string };

      const varName = data.variableName || "resend";
      return {
        ...context,
        [varName]: {
          messageId: resData.id,
          to: toEmail,
          status: "sent",
        },
      };
    });

    await publish(resendChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(resendChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
