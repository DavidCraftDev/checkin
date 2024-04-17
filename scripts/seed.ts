import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminCount = await prisma.user.count({
    where: {
      permission: 2
    }
  });
  if(adminCount < 1) {
    if(!process.env.DEFAULT_ADMIN_PASSWORD) {
      throw new Error("No default admin password provided in environment variables. Please provide one in the .env file.");
    }
    if(!process.env.DEFAULT_ADMIN_USERNAME) {
      throw new Error("No default admin username provided in environment variables. Please provide one in the .env file.");
    }
    const passwordHash = await hash(process.env.DEFAULT_ADMIN_PASSWORD, 12);
    const user = await prisma.user.create({
      data: {
        username: process.env.DEFAULT_ADMIN_USERNAME,
        displayname: "Default Admin",
        password: passwordHash,
        permission: 2
      }
    })
    console.log("New default admin created because no admins were found in the database.");
    console.log("Username: ", user.username);
    console.log("Password: ", process.env.DEFAULT_ADMIN_PASSWORD);
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
