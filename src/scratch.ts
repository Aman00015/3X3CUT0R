import prisma from "./lib/db";

async function run() {
  const ex = await prisma.execution.findFirst({
    orderBy: { startedAt: "desc" },
    include: { workflow: { include: { nodes: true } } }
  });
  if (!ex) return console.log("No execution found");
  console.log(JSON.stringify(ex.workflow.nodes.map(n => ({ type: n.type, data: n.data })), null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
