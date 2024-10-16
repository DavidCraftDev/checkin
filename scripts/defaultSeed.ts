import { config_data } from "@/app/src/modules/config/config";
import logger from "../app/src/modules/logger";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

export async function seedDefaultData(prisma: PrismaClient) {
    const adminCount = await prisma.user.count({
        where: {
            permission: 2
        }
    });
    if (adminCount < 1) {
        let default_username = config_data.DEFAULT_LOGIN.USERNAME;
        if(config_data.LDAP.ENABLE) default_username = "local/" + default_username;
        const usernameCount = await prisma.user.count({
            where: {
                username: default_username.toLowerCase()
            }
        });
        if (usernameCount > 0) {
            logger.error("Default admin username already exists in the database and there a no other admin user. Please provide a different username in the config file.", "Seed");
            process.exit(1);
        }
        const passwordHash = await hash(config_data.DEFAULT_LOGIN.PASSWORD, 12);
        const user = await prisma.user.create({
            data: {
                username: default_username.toLowerCase(),
                displayname: "Default Admin",
                password: passwordHash,
                permission: 2,
                pwdLastSet: new Date()
            }
        })
        logger.info("New default admin created because no admins were found in the database.", "Seed");
        logger.info("Username: " + user.username, "Seed");
    }
    return
}
