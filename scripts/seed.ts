import { PrismaClient } from "@prisma/client";
import { seedLdapData } from "./ldapSeed";
import { seedDefaultData } from "./defaultSeed";
import { use_ldap } from "../app/src/modules/config";

const prisma = new PrismaClient();

async function main() {
  if (use_ldap) {
    console.log("[Info] [Seed] Use LDAP Auth...")
    await seedLdapData(prisma);
    return
  } else {
    console.log("[Info] [Seed] Use Default Auth...")
    await seedDefaultData(prisma);
    return
  }
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("[Error] [Seed] " + e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(() => {
    console.info('[Info] [Seed] Exiting seeding...');
    process.exit(0);
  });
