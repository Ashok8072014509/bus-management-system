const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const buses = await prisma.bus.count();
  const drivers = await prisma.driver.count();
  const dailies = await prisma.daily.count();
  console.log(`Buses: ${buses}, Drivers: ${drivers}, Dailies: ${dailies}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
