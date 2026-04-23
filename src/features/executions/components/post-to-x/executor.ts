import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { postToXChannel } from "@/inngest/channels/post-to-x";
import { TwitterApi } from "twitter-api-v2";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

type PostToXData = {
  variableName?: string;
  credentialId?: string;
  content?: string;
};

function interpolate(template: string, context: Record<string, unknown>): string {
  const compiled = Handlebars.compile(template)(context);
  return decode(compiled);
}

export const postToXExecutor: NodeExecutor<PostToXData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(postToXChannel().status({ nodeId, status: "loading" }));

  if (!data.credentialId) {
    await publish(postToXChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Post to X: Credential is required");
  }

  const credential = await step.run("get-x-credential", () => {
    return prisma.credential.findUnique({
      where: { id: data.credentialId, userId },
    });
  });

  if (!credential) {
    await publish(postToXChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Post to X: Credential not found");
  }

  const xTokenString = decrypt(credential.value);
  const keys = xTokenString.split(",").map((k) => k.trim());

  if (keys.length !== 4) {
    await publish(postToXChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError(
      "Post to X: Invalid Credential format. Please update your X Credential to be a comma-separated list of 4 keys: API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_SECRET"
    );
  }

  const [appKey, appSecret, accessToken, accessSecret] = keys;

  const rawContent = data.content || "{{gemini_chat.post_content}}";
  let tweetContent = interpolate(rawContent, context);

  if (!tweetContent) {
    await publish(postToXChannel().status({ nodeId, status: "error" }));
    throw new NonRetriableError("Post to X: Content is required");
  }

  if (tweetContent.length > 280) {
    tweetContent = tweetContent.substring(0, 277) + "...";
  }

  try {
    const result = await step.run(`post-to-x-${nodeId}`, async () => {
      const client = new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret,
      });

      const tweet = await client.v2.tweet(tweetContent);

      if (!tweet.data?.id) {
        throw new NonRetriableError(`X API Error: Failed to create tweet`);
      }

      const tweetId = tweet.data.id;

      const varName = data.variableName || "x_post";
      return {
        ...context,
        [varName]: {
          tweet_id: tweetId,
          tweet_url: `https://twitter.com/user/status/${tweetId}`,
        },
      };
    });

    await publish(postToXChannel().status({ nodeId, status: "success" }));
    return result;
  } catch (error) {
    await publish(postToXChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
