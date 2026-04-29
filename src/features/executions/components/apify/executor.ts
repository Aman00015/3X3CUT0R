import { NodeExecutor } from "../../types";
import prisma from "@/lib/db";
import ky from "ky";
import { decrypt } from "@/lib/encryption";
import { apifyChannel } from "@/inngest/channels/apify";

export const apifyExecutor: NodeExecutor = async ({
  data,
  nodeId,
  userId,
  context,
  publish,
}) => {
  await publish(apifyChannel().status({ nodeId, status: "loading" }));
  const { variableName, credentialId, searchQuery, maxResults } = data as {
    variableName: string;
    credentialId: string;
    searchQuery: string;
    maxResults: number;
  };

  const credential = await prisma.credential.findUniqueOrThrow({
    where: { id: credentialId, userId },
  });

  const apiToken = decrypt(credential.value);

  // Apify API integration
  // Actor: compass/crawler-google-places
  try {
    // 1. Run the actor
    const runResponse = await ky.post(`https://api.apify.com/v2/acts/compass~crawler-google-places/runs`, {
      searchParams: {
        token: apiToken,
        waitForFinish: 60, // Wait up to 60 seconds
      },
      json: {
        searchStringsArray: [searchQuery],
        maxCrawledPlacesPerSearch: maxResults || 5,
        scrapePlaceDetailPage: false, // Prevents 50+ column bloat
        maxImages: 0,
        scrapeReviews: false,
        scrapePhotos: false,
        scrapeQuestionsAndAnswers: false,
        scrapeWebsites: true,
        onePageOnly: true,
      },
      timeout: 120000, // 2 minutes timeout for the request itself
    }).json<any>();

    const runId = runResponse.data.id;
    const defaultDatasetId = runResponse.data.defaultDatasetId;

    // 2. Fetch dataset items
    const datasetItems = await ky.get(`https://api.apify.com/v2/datasets/${defaultDatasetId}/items`, {
      searchParams: {
        token: apiToken,
      }
    }).json<any[]>();

    // 3. Filter to only basic columns to avoid Google Sheets column limits
    const filteredItems = datasetItems.map(item => ({
      title: item.title,
      website: item.website,
      phone: item.phone,
      categoryName: item.categoryName,
      address: item.address,
      totalScore: item.totalScore,
      url: item.url,
    }));

    await publish(apifyChannel().status({ nodeId, status: "success" }));
    return {
      ...context,
      [variableName]: filteredItems,
    };
  } catch (error: any) {
    console.error("Apify error:", error);
    await publish(apifyChannel().status({ nodeId, status: "error" }));
    throw new Error(`Apify failed: ${error.message}`);
  }
};
