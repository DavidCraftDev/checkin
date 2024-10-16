import { PrismaClient } from "@prisma/client";
import { seedLdapData } from "./ldapSeed";
import { seedDefaultData } from "./defaultSeed";
import logger from "../app/src/modules/logger";
import { cleanUpData } from "./cleanUp";
import { config_data } from "@/app/src/modules/config/config";

const prisma = new PrismaClient();

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
