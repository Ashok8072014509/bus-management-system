import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'SAA8660@gmail.com' },
    update: {
      password: adminPassword
    },
    create: {
      email: 'SAA8660@gmail.com',
      password: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  console.log({ adminUser });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
