import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { seedLdapData } from "./ldapSeed";
import { seedDefaultData } from "./defaultSeed";
import logger from "../app/src/modules/logger";
import { cleanUpData } from "./cleanUp";
import { config_data } from "../app/src/modules/data/config";

if (!process.env.POSTGRES_URL) {
    logger.error('POSTGRES_URL environment variable is not defined', "Seed");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  if (config_data.LDAP.ENABLE) {
    logger.info("Use LDAP Auth...", "Seed")
    await seedLdapData();
    await seedDefaultData(prisma);
  } else {
    logger.info("Use Default Auth...", "Seed")
    await seedDefaultData(prisma);
  }
  cleanUpData(prisma);
  return;
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    logger.error(e, "Seed")
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(() => {
    logger.info("Exiting seeding...", "Seed")
    process.exit(0);
  });
