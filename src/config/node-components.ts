import { InitialNode } from "@/components/initial-node";
import { NodeType } from "@/generated/prisma";
import type { NodeTypes } from "@xyflow/react";

import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { GoogleFormTrigger } from "@/features/triggers/components/google-form-trigger/node";
import { StripeTriggerNode } from "@/features/triggers/components/stripe-trigger/node";
import { GeminiNode } from "@/features/executions/components/gemini/node";
import { OpenAiNode } from "@/features/executions/components/openai/node";
import { AnthropicNode } from "@/features/executions/components/anthropic/node";
import { DiscordNode } from "@/features/executions/components/discord/node";
import { SlackNode } from "@/features/executions/components/slack/node";
import { OutputNode } from "@/features/executions/components/output/node";
import { RazorpayTriggerNode } from "@/features/triggers/components/razorpay-trigger/node";
import { NotionNode } from "@/features/executions/components/notion/node";
import { WhatsAppNode } from "@/features/executions/components/whatsapp/node";
import { ResendNode } from "@/features/executions/components/resend/node";
import { GeminiChatNode } from "@/features/executions/components/gemini-chat/node";
import { HumanApprovalNode } from "@/features/executions/components/human-approval/node";
import { PostToXNode } from "@/features/executions/components/post-to-x/node";
import { PostToRedditNode } from "@/features/executions/components/post-to-reddit/node";
import { ApifyNode } from "@/features/executions/components/apify/node";
import { GoogleSheetsActionNode } from "@/features/executions/components/google-sheets/node";
import { GoogleSheetsTriggerNode } from "@/features/triggers/components/google-sheets-trigger/node";

import { CronTriggerNode, GitHubNode, ConditionNode, DelayNode, TransformNode } from "@/nodes";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTrigger,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.GEMINI]: GeminiNode,
  [NodeType.OPENAI]: OpenAiNode,
  [NodeType.ANTHROPIC]: AnthropicNode,
  [NodeType.DISCORD]: DiscordNode,
  [NodeType.SLACK]: SlackNode,
  [NodeType.RAZORPAY_PAYMENT_CAPTURED]: RazorpayTriggerNode,
  [NodeType.NOTION_CREATE_PAGE]: NotionNode,
  [NodeType.WHATSAPP_SEND_MESSAGE]: WhatsAppNode,
  [NodeType.RESEND_SEND_EMAIL]: ResendNode,
  [NodeType.GEMINI_CHAT]: GeminiChatNode,
  [NodeType.HUMAN_APPROVAL]: HumanApprovalNode,
  [NodeType.POST_TO_X]: PostToXNode,
  [NodeType.POST_TO_REDDIT]: PostToRedditNode,
  [NodeType.APIFY]: ApifyNode,
  [NodeType.GOOGLE_SHEETS_TRIGGER]: GoogleSheetsTriggerNode,
  [NodeType.GOOGLE_SHEETS_ACTION]: GoogleSheetsActionNode,
  [NodeType.OUTPUT]: OutputNode,
  [NodeType.CRON_TRIGGER]: CronTriggerNode as any,
  [NodeType.GITHUB]: GitHubNode as any,
  [NodeType.CONDITION]: ConditionNode as any,
  [NodeType.DELAY]: DelayNode as any,
  [NodeType.TRANSFORM]: TransformNode as any,
} as const;

export type RegisteredNodeType = keyof typeof nodeComponents;
