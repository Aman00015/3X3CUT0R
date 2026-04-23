import ky from "ky";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  const apiKey = process.env.NOTION_API_KEY;

  if (!apiKey) {
    console.error("No NOTION_API_KEY found in .env");
    return;
  }

  console.log("Searching for all databases the integration can see...");
  try {
    const response = await ky.post(`https://api.notion.com/v1/search`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      json: {
        filter: {
          property: "object",
          value: "database"
        }
      }
    });

    if (!response.ok) {
       const err = await response.json();
       console.error("Search API Error:", JSON.stringify(err, null, 2));
       return;
    }

    const data = await response.json() as any;
    console.log(`Found ${data.results.length} databases:`);
    for (const db of data.results) {
      console.log(`- Title: ${db.title?.[0]?.plain_text || "No Title"}`);
      console.log(`  ID: ${db.id}`);
      console.log(`  Properties: ${Object.keys(db.properties).join(", ")}`);
      console.log("---");
    }
  } catch (error: any) {
    console.error("Search failed:", error.message);
  }
}

run();
