import { seedLdapData } from "./ldapSeed";
import { seedDefaultData } from "./defaultSeed";
import logger from "@/app/src/modules/logger";
import { cleanUpData } from "./cleanUp";
import { config_data } from "@/app/src/modules/data/config";
import db from "@/app/src/modules/db";

const prisma = db;

async function main() {
  if (config_data.LDAP.ENABLE) {
    logger.info("Die LDAP-Authentifizierung wird herbeigerufen...", "Seed")
    await seedLdapData();
    await seedDefaultData(prisma);
  } else {
    logger.info("Die Standard-Authentifizierung tritt in Kraft...", "Seed")
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
    logger.info("Die Aussaat ist vollendet — das System kehrt zur Stille zurück", "Seed")
    process.exit(0);
  });
