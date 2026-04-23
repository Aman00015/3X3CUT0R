import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { geminiChatChannel } from "@/inngest/channels/gemini-chat";
import ky from "ky";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

type GeminiChatData = {
  variableName?: string;
  systemPrompt?: string;
  userMessage?: string;
  credentialId?: string;
};

function interpolate(template: string, context: Record<string, unknown>): string {
  const compiled = Handlebars.compile(template)(context);
  return decode(compiled);
}

export const geminiChatExecutor: NodeExecutor<GeminiChatData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(geminiChatChannel().status({ nodeId, status: "loading" }));

  if (!data.credentialId) {
    await publish(geminiChatChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Gemini Chat: Credential is required");
  }

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: { id: data.credentialId, userId },
    });
  });

  if (!credential) {
    await publish(geminiChatChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Gemini Chat: Credential not found");
  }

  const apiKey = decrypt(credential.value);

  const defaultSystem = "You are a social media expert. Summarize the given article into a single X (Twitter) post under 280 characters. Return plain text only, no explanation.";
  const defaultUser = "Article content: {{http.body}}";

  const rawSystem = data.systemPrompt || defaultSystem;
  const rawUser = data.userMessage || defaultUser;

  const systemInstruction = interpolate(rawSystem, context);
  const userMessage = interpolate(rawUser, context);

  try {
    const result = await step.run(`gemini-chat-${nodeId}`, async () => {
      const response = await ky.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent", {
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        json: {
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [{
            parts: [{ text: userMessage }]
          }],
          generationConfig: {
            temperature: 0.7
          }
        },
        timeout: 60000,
        throwHttpErrors: false,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new NonRetriableError(`Gemini API Error ${response.status}: ${errorBody}`);
      }

      const resData = await response.json() as any;
      
      const textResponse = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!textResponse) {
         throw new NonRetriableError("Gemini returned an empty response.");
      }

      const varName = data.variableName || "gemini_chat";
      return {
        ...context,
        [varName]: {
          post_content: textResponse.trim(),
        },
      };
    });

    await publish(geminiChatChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(geminiChatChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
