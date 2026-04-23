import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { postToRedditChannel } from "@/inngest/channels/post-to-reddit";
import ky from "ky";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

type PostToRedditData = {
  variableName?: string;
  credentialId?: string;
  subreddit?: string;
  title?: string;
  text?: string;
};

function interpolate(template: string, context: Record<string, unknown>): string {
  const compiled = Handlebars.compile(template)(context);
  return decode(compiled);
}

export const postToRedditExecutor: NodeExecutor<PostToRedditData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(postToRedditChannel().status({ nodeId, status: "loading" }));

  if (!data.credentialId) {
    await publish(postToRedditChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Post to Reddit: Credential is required");
  }

  const credential = await step.run("get-reddit-credential", () => {
    return prisma.credential.findUnique({
      where: { id: data.credentialId, userId },
    });
  });

  if (!credential) {
    await publish(postToRedditChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Post to Reddit: Credential not found");
  }

  const redditCreds = decrypt(credential.value);
  const creds = redditCreds.split(",").map((c) => c.trim());
  if (creds.length !== 4) {
    await publish(postToRedditChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Post to Reddit: Invalid Credential format. Expected: CLIENT_ID, CLIENT_SECRET, USERNAME, PASSWORD");
  }

  const [clientId, clientSecret, username, password] = creds;

  const subreddit = interpolate(data.subreddit || "test", context);
  const title = interpolate(data.title || "New Article Summary", context);
  const text = interpolate(data.text || "{{gemini_chat.post_content}}", context);

  try {
    const result = await step.run(`post-to-reddit-${nodeId}`, async () => {
      // 1. Get Access Token
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const tokenResponse = await ky.post("https://www.reddit.com/api/v1/access_token", {
        headers: {
          Authorization: `Basic ${auth}`,
          "User-Agent": "executor-bot/0.1 by amanmansuri",
        },
        body: new URLSearchParams({
          grant_type: "password",
          username,
          password,
        }),
      }).json() as any;

      const accessToken = tokenResponse.access_token;

      // 2. Submit Post
      const submitResponse = await ky.post("https://oauth.reddit.com/api/submit", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "executor-bot/0.1 by amanmansuri",
        },
        body: new URLSearchParams({
          sr: subreddit,
          kind: "self",
          title,
          text,
        }),
      }).json() as any;

      if (submitResponse.json?.errors?.length > 0) {
        throw new Error(`Reddit API Error: ${JSON.stringify(submitResponse.json.errors)}`);
      }

      const postUrl = submitResponse.json?.data?.url;
      const varName = data.variableName || "reddit_post";

      return {
        ...context,
        [varName]: {
          url: postUrl,
          id: submitResponse.json?.data?.id,
        },
      };
    });

    await publish(postToRedditChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(postToRedditChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
