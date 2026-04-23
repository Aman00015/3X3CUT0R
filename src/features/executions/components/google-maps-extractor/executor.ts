"use server";

import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky from "ky";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import type { NodeExecutor } from "@/features/executions/types";
import { googleMapsExtractorChannel } from "@/inngest/channels/google-maps-extractor";
import type { StructuredNodeOutput } from "@/features/executions/lib/structured-output";

type GoogleMapsExtractorData = {
  variableName?: string;
  credentialId?: string;
  searchQuery?: string;
  maxLeads?: number;
};

export const googleMapsExtractorExecutor: NodeExecutor<GoogleMapsExtractorData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(googleMapsExtractorChannel().status({ nodeId, status: "loading" }));

  if (!data.credentialId) {
    await publish(googleMapsExtractorChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Google Maps Extractor: Credential is required");
  }

  if (!data.searchQuery) {
    await publish(googleMapsExtractorChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Google Maps Extractor: Search query is missing");
  }

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: { id: data.credentialId, userId },
    });
  });

  if (!credential) {
    await publish(googleMapsExtractorChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Google Maps Extractor: Credential not found");
  }

  const apiKey = decrypt(credential.value);
  const query = Handlebars.compile(data.searchQuery)(context);
  const maxLeads = data.maxLeads || 5;

  const systemInstruction = `You are a professional lead generation assistant. Your task is to extract business leads from Google Maps based on the user's query.
You MUST use your search capabilities to find real-time information.
Return a JSON array of objects. Each object should have:
- name: The name of the business
- address: Full physical address
- phone: Phone number (if available)
- website: Official website URL (if available)
- rating: Google Maps rating (if available)
- reviews: Number of reviews (if available)

Important: Return ONLY the raw JSON array. No markdown code blocks, no explanation. Just the [].
Maximum leads to return: ${maxLeads}`;

  try {
    const result = await step.run(`extract-leads-${nodeId}`, async () => {
      const response = await ky.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent",
        {
          headers: {
            "x-goog-api-key": apiKey,
            "Content-Type": "application/json",
          },
          json: {
            system_instruction: {
              parts: [{ text: systemInstruction }]
            },
            contents: [{
              parts: [{ text: `Extract business leads for: ${query}` }]
            }],
            tools: [
              {
                google_search: {}
              }
            ],
            generationConfig: {
              temperature: 0.1,
              response_mime_type: "application/json"
            }
          },
          timeout: 120000,
          throwHttpErrors: false,
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        const isRateLimit = /quota exceeded|rate limit|too many requests|429|limit:\s*0/i.test(errorBody);
        
        if (isRateLimit) {
           throw new NonRetriableError(`Gemini 3 Preview Quota Exceeded (429). Please check your Google AI Studio billing or wait a few minutes before trying again.`);
        }

        throw new NonRetriableError(`Gemini API Error ${response.status}: ${errorBody}`);
      }

      const resData = await response.json() as any;
      const textResponse = resData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

      let leads = [];
      try {
        leads = JSON.parse(textResponse);
      } catch (e) {
        console.error("Failed to parse Gemini response as JSON", textResponse);
        leads = [];
      }

      const varName = data.variableName || "leads";
      return {
        ...context,
        [varName]: {
          type: "json",
          content: leads,
          meta: {
            model: "gemini-3-flash-preview",
            timestamp: new Date().toISOString(),
          }
        } satisfies StructuredNodeOutput,
      };
    });

    await publish(googleMapsExtractorChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(googleMapsExtractorChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
