import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('POSTGRES_URL is required for seeding.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

async function main() {
  const username = process.env.DEFAULT_LOGIN_USERNAME || 'admin';
  const password = process.env.DEFAULT_LOGIN_PASSWORD || 'admin';

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { username },
    update: {
      password: passwordHash,
      displayname: 'Administrator',
      permission: 2
    },
    create: {
      username,
      displayname: 'Administrator',
      permission: 2,
      password: passwordHash,
      group: [],
      needs: [],
      competence: [],
      courses: []
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
