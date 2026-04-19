import { realtimeMiddleware } from "@inngest/realtime/middleware";
import { Inngest } from "inngest";

export const inngest = new Inngest({ 
  id: "executor",
  eventKey: process.env.INNGEST_EVENT_KEY,
  isDev: process.env.NODE_ENV !== "production",
  middleware: [realtimeMiddleware()],
});
