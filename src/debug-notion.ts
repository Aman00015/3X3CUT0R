import ky from "ky";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  const databaseId = "34837c973a6f80cca120000b090b0aad";
  const apiKey = process.env.NOTION_API_KEY;

  if (!apiKey) {
    console.error("No NOTION_API_KEY found in .env");
    return;
  }

  console.log("Fetching database structure for ID:", databaseId);
  try {
    const response = await ky.get(`https://api.notion.com/v1/databases/${databaseId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
      },
    });

    if (!response.ok) {
       const err = await response.json();
       console.error("API Error:", JSON.stringify(err, null, 2));
       return;
    }

    const data = await response.json() as any;
    console.log("Database Title:", data.title?.[0]?.plain_text || "No Title");
    console.log("Properties found:");
    for (const [name, prop] of Object.entries(data.properties)) {
      console.log(`- "${name}" (Type: ${(prop as any).type})`);
    }
  } catch (error: any) {
    console.error("Network or script error:", error.message);
  }
}

run();
