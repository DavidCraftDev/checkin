import { default_password, default_username, ldap_create_local_admin } from "../app/src/modules/config";
import { getAllUsers } from "../app/src/modules/ldapUtilities";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

export async function seedLdapData(prisma: PrismaClient) {
    await getAllUsers()
    if (ldap_create_local_admin) {
        const username = default_username
        const password = default_password
        const passwordHash = await hash(password, 12);
        const count = await prisma.user.count({ where: { username: "local/" + username } })
        if (count == 0) {
            await prisma.user.create({
                data: {
                    username: "local/" + username,
                    displayname: "Default Admin",
                    password: passwordHash,
                    permission: 2
                }
            })
            console.log("[Info] [Seed] Local Admin created: local/" + username)
        }
    }
    console.log("[Info] [Seed] LDAP data seeded successfully!")
    return
}
