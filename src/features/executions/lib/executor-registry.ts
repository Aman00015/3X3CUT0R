import { NodeType } from "@/generated/prisma";
import { NodeExecutor } from "../types";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { geminiExecutor } from "../components/gemini/executor";
import { openAiExecutor } from "../components/openai/executor";
import { anthropicExecutor } from "../components/anthropic/executor";
import { discordExecutor } from "../components/discord/executor";
import { slackExecutor } from "../components/slack/executor";
import { outputExecutor } from "../components/output/executor";
import { razorpayTriggerExecutor } from "@/features/triggers/components/razorpay-trigger/executor";
import { notionCreatePageExecutor } from "../components/notion/executor";
import { whatsAppSendMessageExecutor } from "../components/whatsapp/executor";
import { resendSendEmailExecutor } from "../components/resend/executor";
import { geminiChatExecutor } from "../components/gemini-chat/executor";
import { humanApprovalExecutor } from "../components/human-approval/executor";
import { postToXExecutor } from "../components/post-to-x/executor";
import { postToRedditExecutor } from "../components/post-to-reddit/executor";
import { apifyExecutor } from "../components/apify/executor";
import { googleSheetsTriggerExecutor } from "@/features/triggers/components/google-sheets-trigger/executor";
import { googleSheetsActionExecutor } from "../components/google-sheets/executor";

// Removing OUTPUT_NODE_TYPE constant since OUTPUT is now in the enum

const noOpExecutor: NodeExecutor = async ({ context }) => context;

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.INTIAL]: manualTriggerExecutor,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
  [NodeType.OPENAI]: openAiExecutor,
  [NodeType.DISCORD]: discordExecutor,
  [NodeType.SLACK]: slackExecutor,
  [NodeType.RAZORPAY_PAYMENT_CAPTURED]: razorpayTriggerExecutor,
  [NodeType.NOTION_CREATE_PAGE]: notionCreatePageExecutor,
  [NodeType.WHATSAPP_SEND_MESSAGE]: whatsAppSendMessageExecutor,
  [NodeType.RESEND_SEND_EMAIL]: resendSendEmailExecutor,
  [NodeType.GEMINI_CHAT]: geminiChatExecutor,
  [NodeType.HUMAN_APPROVAL]: humanApprovalExecutor,
  [NodeType.POST_TO_X]: postToXExecutor,
  [NodeType.POST_TO_REDDIT]: postToRedditExecutor,
  [NodeType.APIFY]: apifyExecutor,
  [NodeType.GOOGLE_SHEETS_TRIGGER]: googleSheetsTriggerExecutor,
  [NodeType.GOOGLE_SHEETS_ACTION]: googleSheetsActionExecutor,
  [NodeType.OUTPUT]: outputExecutor,
  [NodeType.CRON_TRIGGER]: noOpExecutor,
  [NodeType.GITHUB]: noOpExecutor,
  [NodeType.CONDITION]: noOpExecutor,
  [NodeType.DELAY]: noOpExecutor,
  [NodeType.TRANSFORM]: noOpExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }

  return executor;
};
