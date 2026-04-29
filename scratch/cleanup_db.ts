import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up GOOGLE_MAPS_EXTRACTOR nodes using custom client path...");
  
  const deletedCount = await prisma.$executeRawUnsafe(`DELETE FROM "Node" WHERE type::text = 'GOOGLE_MAPS_EXTRACTOR'`);
  
  console.log(`Deleted ${deletedCount} nodes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
