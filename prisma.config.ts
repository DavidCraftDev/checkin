
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.POSTGRES_URL!,
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx scripts/seed.monorepo.ts',
  },
});
