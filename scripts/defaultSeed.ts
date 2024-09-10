import { default_password, default_username } from "../app/src/modules/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

export async function seedDefaultData(prisma: PrismaClient) {
    const adminCount = await prisma.user.count({
        where: {
            permission: 2
        }
    });
    if (adminCount < 1) {
        if (default_password) {
            throw new Error("[Seed] No default admin password provided in environment variables. Please provide one in the .env file.");
        }
        if (default_username) {
            throw new Error("[Seed] No default admin username provided in environment variables. Please provide one in the .env file.");
        }
        const usernameCount = await prisma.user.count({
            where: {
                username: default_username.toLowerCase()
            }
        });
        if (usernameCount > 0) {
            throw new Error("[Seed] Default admin username already exists in the database and there a no other admin user. Please provide a different username in the .env file.");
        }
        const password: string = default_password
        const passwordHash = await hash(password, 12);
        const user = await prisma.user.create({
            data: {
                username: default_username.toLowerCase(),
                displayname: "Default Admin",
                password: passwordHash,
                permission: 2,
                loginVersion: 0
            }
        })
        console.log("[Seed] New default admin created because no admins were found in the database.");
        console.log({ user });
    }
    return
}