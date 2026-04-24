import { realtimeMiddleware } from "@inngest/realtime/middleware";
import { Inngest } from "inngest";

const eventKey = process.env.INNGEST_EVENT_KEY?.trim();
const isNodeDev = process.env.NODE_ENV !== "production";
const isInngestDev = isNodeDev && process.env.INNGEST_DEV === "1";

const getInngestEventKeyError = () => {
  if (!eventKey && !isInngestDev && !isNodeDev) {
    return "Workflow execution is not configured in this deployment. Set INNGEST_EVENT_KEY to send events to Inngest Cloud.";
  }

  return null;
};

export const assertInngestEventSendConfigured = () => {
  const errorMessage = getInngestEventKeyError();

  if (errorMessage) {
    throw new Error(errorMessage);
  }
};

const inngestConfigError = getInngestEventKeyError();

if (inngestConfigError) {
  console.warn(inngestConfigError);
}

if (!isNodeDev && process.env.INNGEST_DEV === "1") {
  console.warn("INNGEST_DEV is ignored in production. Remove it from Vercel and rely on INNGEST_EVENT_KEY for Cloud execution.");
}

export const inngest = new Inngest({
  id: "executor",
  eventKey,
  isDev: isInngestDev || isNodeDev,
  middleware: [realtimeMiddleware()],
});
