import { PrismaClient } from "@/app/src/modules/db";
import { config_data } from "@/app/src/modules/data/config";
import logger from "@/app/src/modules/logger";
import { hash } from "bcryptjs";

export async function seedDefaultData(prisma: PrismaClient) {
    const adminCount = await prisma.user.count({
        where: {
            permission: 2
        }
    });
    if (adminCount < 1) {
        let default_username = config_data.DEFAULT_LOGIN.USERNAME;
        if (config_data.LDAP.ENABLE) default_username = "local/" + default_username;
        const usernameCount = await prisma.user.count({
            where: {
                username: default_username.toLowerCase()
            }
        });
        if (usernameCount > 0) {
            logger.error("Das Standard-Verwaltungswesen existiert bereits in den Registern, doch es gibt keinen anderen Verwalter — bitte ändere den Namen in der Konfigurationsakte", "Seed");
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
        logger.info("Ein neues Verwaltungswesen wurde erschaffen, denn die Register waren leer", "Seed");
        logger.info("Name des Wesens: " + user.username, "Seed");
    }
    return
}
