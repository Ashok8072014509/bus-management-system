const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const d = await prisma.daily.findMany({ include: { bus: true, driver: true, conductor: true, trip: true } });
    console.log("Success! Dailies length: " + d.length);
  } catch (e) {
    console.error("ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
