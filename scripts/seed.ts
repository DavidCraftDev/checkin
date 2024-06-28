import { convertGUID, search } from "../app/src/modules/ldap";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (!process.env.example || !process.env.test) throw new Error("LDAP search filter and base are required");
  const ldapData: any[] = await search(process.env.example, process.env.test);
  ldapData.forEach(async (entry) => {
    const count = await prisma.user.count({
      where: {
        id: String(await convertGUID(entry.objectGUID))
      }
    });
    if (count === 0) {
      const user = await prisma.user.create({
        data: {
          id: String(await convertGUID(entry.objectGUID)),
          username: String(entry.sAMAccountName).toLowerCase(),
          displayname: String(entry.displayName),
          permission: 0,
          loginVersion: Number(entry.pwdLastSet)
        }
      })
      console.log("New user created from LDAP data:" + user.displayname);
    }
  });
  const adminCount = await prisma.user.count({
    where: {
      permission: 2
    }
  });
  if (adminCount < 1) {
    if (!process.env.DEFAULT_ADMIN_PASSWORD) {
      throw new Error("No default admin password provided in environment variables. Please provide one in the .env file.");
    }
    if (!process.env.DEFAULT_ADMIN_USERNAME) {
      throw new Error("No default admin username provided in environment variables. Please provide one in the .env file.");
    }
    const usernameCount = await prisma.user.count({
      where: {
        username: process.env.DEFAULT_ADMIN_USERNAME.toLowerCase()
      }
    });
    if (usernameCount > 0) {
      throw new Error("Default admin username already exists in the database and there a no other admin user. Please provide a different username in the .env file.");
    }
    const password: string = process.env.DEFAULT_ADMIN_PASSWORD;
    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username: process.env.DEFAULT_ADMIN_USERNAME.toLowerCase(),
        displayname: "Default Admin",
        password: passwordHash,
        permission: 2
      }
    })
    console.log("New default admin created because no admins were found in the database.");
    console.log({ user });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
