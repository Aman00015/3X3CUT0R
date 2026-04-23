import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { whatsappChannel } from "@/inngest/channels/whatsapp";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

type WhatsAppProvider = "twilio" | "meta";

type WhatsAppData = {
  variableName?: string;
  provider?: WhatsAppProvider;
  // Twilio
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  // Meta
  phoneNumberId?: string;
  accessToken?: string;
  // Common
  toPhone?: string;
  messageBody?: string;
};

function interpolate(template: string, context: Record<string, unknown>): string {
  const compiled = Handlebars.compile(template)(context);
  return decode(compiled);
}

async function sendViaTwilio(
  accountSid: string,
  authToken: string,
  from: string,
  to: string,
  body: string,
): Promise<{ sid: string; status: string }> {
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const formData = new URLSearchParams({
    From: `whatsapp:${from}`,
    To: `whatsapp:${to}`,
    Body: body,
  });

  const response = await ky.post(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      throwHttpErrors: false,
    },
  );

  if (!response.ok) {
    const err = await response.json() as { message?: string };
    throw new NonRetriableError(
      `Twilio error ${response.status}: ${err?.message ?? "Unknown error"}`,
    );
  }

  return response.json() as Promise<{ sid: string; status: string }>;
}

async function sendViaMeta(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  body: string,
): Promise<{ messages: Array<{ id: string }> }> {
  const response = await ky.post(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      json: {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      },
      throwHttpErrors: false,
    },
  );

  if (!response.ok) {
    const err = await response.json() as { error?: { message?: string } };
    throw new NonRetriableError(
      `Meta WhatsApp error ${response.status}: ${err?.error?.message ?? "Unknown error"}`,
    );
  }

  return response.json() as Promise<{ messages: Array<{ id: string }> }>;
}

export const whatsAppSendMessageExecutor: NodeExecutor<WhatsAppData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(whatsappChannel().status({ nodeId, status: "loading" }));

  const provider: WhatsAppProvider = data.provider ?? "twilio";

  const toPhone = data.toPhone
    ? interpolate(data.toPhone, context)
    : String((context.razorpay as Record<string, unknown>)?.customer_phone ?? "");

  if (!toPhone) {
    await publish(whatsappChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("WhatsApp node: to_phone is required");
  }

  const rawTemplate = data.messageBody ?? "";
  const messageBody = interpolate(rawTemplate, context);

  if (!messageBody) {
    await publish(whatsappChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("WhatsApp node: message_body is required");
  }

  try {
    const result = await step.run(`whatsapp-send-${nodeId}`, async () => {
      let messageId: string | undefined;

      if (provider === "twilio") {
        const accountSid = data.accountSid || process.env.TWILIO_ACCOUNT_SID;
        const authToken = data.authToken || process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = data.fromNumber || process.env.TWILIO_WHATSAPP_FROM;

        if (!accountSid || !authToken || !fromNumber) {
          throw new NonRetriableError(
            "WhatsApp Twilio node: accountSid, authToken, and fromNumber are required",
          );
        }

        const res = await sendViaTwilio(accountSid, authToken, fromNumber, toPhone, messageBody);
        messageId = res.sid;
      } else {
        const phoneNumberId = data.phoneNumberId || process.env.META_WHATSAPP_PHONE_NUMBER_ID;
        const accessToken = data.accessToken || process.env.META_WHATSAPP_ACCESS_TOKEN;

        if (!phoneNumberId || !accessToken) {
          throw new NonRetriableError(
            "WhatsApp Meta node: phoneNumberId and accessToken are required",
          );
        }

        const res = await sendViaMeta(phoneNumberId, accessToken, toPhone, messageBody);
        messageId = res.messages?.[0]?.id;
      }

      const varName = data.variableName || "whatsapp";
      return {
        ...context,
        [varName]: {
          messageId,
          to: toPhone,
          provider,
          status: "sent",
        },
      };
    });

    await publish(whatsappChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(whatsappChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
