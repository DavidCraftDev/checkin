import { PrismaClient } from "@prisma/client";
import { seedLdapData } from "./ldapSeed";
import { seedDefaultData } from "./defaultSeed";

const prisma = new PrismaClient();

async function main() {
  if (process.env.USE_LDAP == "true") {
    console.log("Use LDAP Auth...")
    await seedLdapData(prisma);
    console.log("Data seeded")
    return "LDAP data seeded"
  } else {
    console.log("Use Default Auth...")
    await seedDefaultData(prisma);
    console.log("Data seeded")
    return "Default data seeded"
  }
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
