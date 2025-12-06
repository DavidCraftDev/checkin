import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const { Pool } = pg;
import { seedLdapData } from "./ldapSeed";
import { seedDefaultData } from "./defaultSeed";
import logger from "../app/src/modules/logger";
import { cleanUpData } from "./cleanUp";
import { config_data } from "../app/src/modules/data/config";

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
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
