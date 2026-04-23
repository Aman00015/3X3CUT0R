import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { notionChannel } from "@/inngest/channels/notion";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  return new Handlebars.SafeString(JSON.stringify(context, null, 2));
});

type NotionCreatePageData = {
  variableName?: string;
  databaseId?: string;
  notionApiKey?: string;
};

function buildNotionProperties(context: Record<string, unknown>, availableProps: string[] = []) {
  const r = context.razorpay as Record<string, unknown> | undefined ?? {};
  const g = (context.googleForm as any) ?? {};

  const properties: Record<string, any> = {};
  const has = (name: string) => availableProps.length === 0 || availableProps.includes(name);

  // Helper to add property only if it exists in the database
  const addTitle = (name: string, value: string) => { if (has(name)) properties[name] = { title: [{ text: { content: value || "N/A" } }] }; };
  const addText = (name: string, value: string) => { if (has(name)) properties[name] = { rich_text: [{ text: { content: value || "N/A" } }] }; };
  const addEmail = (name: string, value: string) => { if (has(name)) properties[name] = { email: value || "unknown@example.com" }; };
  const addNumber = (name: string, value: number) => { if (has(name)) properties[name] = { number: value || 0 }; };
  const addDate = (name: string, value: string) => { if (has(name)) properties[name] = { date: { start: value || new Date().toISOString() } }; };

  if (g.respondentEmail || g.responses) {
    // GOOGLE FORM MAPPING (Flexible)
    const responses = g.responses || {};
    const name = responses["Name"] || responses["Full Name"] || "New Lead";
    const email = g.respondentEmail || responses["Email"] || "unknown@example.com";
    const source = g.formTitle || "Google Form";

    // Try multiple possible column names
    if (has("Name")) addTitle("Name", name);
    else if (has("Title")) addTitle("Title", name);
    else if (has("Customer Name")) addTitle("Customer Name", name);

    if (has("Email")) addEmail("Email", email);
    else if (has("Customer Email")) addEmail("Customer Email", email);

    if (has("Source")) addText("Source", source);
    else if (has("Payment ID")) addText("Payment ID", source);

    addDate("Date", new Date().toISOString());
  } else {
    // RAZORPAY MAPPING (Flexible)
    const getStr = (key: string) => String(r[key] ?? "");
    const amount = Number(r["amount"] ?? 0);

    if (has("Title")) addTitle("Title", getStr("order_id") || getStr("payment_id"));
    else if (has("Name")) addTitle("Name", getStr("customer_name"));

    addNumber("Amount", amount);
    addText("Currency", getStr("currency") || "INR");
    addText("Payment ID", getStr("payment_id"));
    
    if (has("Customer Name")) addText("Customer Name", getStr("customer_name"));
    if (has("Customer Email")) addEmail("Customer Email", getStr("customer_email"));
    else if (has("Email")) addEmail("Email", getStr("customer_email"));

    addDate("Date", getStr("created_at"));
  }

  return properties;
}

export const notionCreatePageExecutor: NodeExecutor<NotionCreatePageData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(notionChannel().status({ nodeId, status: "loading" }));

  const databaseId = data.databaseId || process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    await publish(notionChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Notion node: database_id is required");
  }

  const apiKey = data.notionApiKey || process.env.NOTION_API_KEY;
  if (!apiKey) {
    await publish(notionChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Notion node: notion_api_key is required");
  }

  try {
    const result = await step.run("notion-create-page", async () => {
      const callApi = async (props: string[] = []) => {
        const properties = buildNotionProperties(context, props);
        return await ky.post("https://api.notion.com/v1/pages", {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
          json: {
            parent: { database_id: databaseId },
            properties,
          },
          throwHttpErrors: false,
        });
      };

      let response = await callApi();

      // If missing properties (400), fetch database schema and try again with correct mapping
      if (!response.ok && response.status === 400) {
        const dbResponse = await ky.get(`https://api.notion.com/v1/databases/${databaseId}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Notion-Version": "2022-06-28",
          },
        });
        
        if (dbResponse.ok) {
          const dbData = await dbResponse.json() as { properties: Record<string, any> };
          const availableProps = Object.keys(dbData.properties);
          // Try again with the detected properties
          response = await callApi(availableProps);
        }
      }

      if (!response.ok) {
        const errBody = await response.json() as { message?: string };
        throw new Error(errBody?.message || "Notion API error");
      }

      const page = await response.json() as { id: string; url: string };

      const varName = data.variableName || "notion";
      return {
        ...context,
        [varName]: {
          page_id: page.id,
          url: page.url,
        },
      };
    });

    await publish(notionChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error: any) {
    await publish(notionChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError(error.message);
  }
};
