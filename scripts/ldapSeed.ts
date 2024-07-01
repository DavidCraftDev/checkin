import { getAllUsers } from "../app/src/modules/ldap";
import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

export async function seedLdapData(prisma: PrismaClient) {
    const ldapData: any[] = await getAllUsers()
    const ldapUser: any[] = await prisma.user.findMany({ where: { password: null } })
    const exist: Array<string> = []
    await Promise.all(ldapUser.map(async (entry) => {
        const ldapUserData = ldapData.find(e => e.objectGUID === entry.id)
        let permission = {}
        if (process.env.LDAP_AUTO_PERMISSIONS === "true") {
            if (ldapUserData.memberOf.includes(process.env.LDAP_AUTO_ADMIN_GROUP)) permission = { permission: 2 }
            else if (ldapUserData.memberOf.includes(process.env.LDAP_AUTO_TEACHER_GROUP)) permission = { permission: 1 }
            else permission = { permission: 0 }
        } else {
            permission = { permission: 0 }
        }
        let group = {}
        if(process.env.LDAP_AUTO_GROUPS === "true") {
            Promise.all(ldapUserData.memberOf.map(async (groupData: string) => {
                let data = groupData.split(",")
                if (data[1].replace("OU=", "") == process.env.LDAP_AUTO_GROUP_OU) {
                    group = { group: String(data[0].replace("CN=", "")) }
                }
            }))
        }
        let needs = { needs: ["Ja"] as Prisma.JsonArray }
        let competence = { competence: ["Ja"] as Prisma.JsonArray }
        const user = await prisma.user.update({
            where: {
                id: entry.id
            },
            data: {
                username: String(ldapUserData.sAMAccountName).toLowerCase(),
                displayname: String(ldapUserData.displayName),
                ...permission,
                ...group,
                ...needs,
                ...competence
            }
        })
        exist.push(user.id)
        console.log("User data updated from LDAP data:" + user.displayname);
    }));
    const createData: any[] = []
    await Promise.all(ldapData.map(async (entry) => {
        if (!exist.includes(entry.objectGUID)) {
            createData.push({
                id: entry.objectGUID,
                username: String(entry.sAMAccountName).toLowerCase(),
                displayname: String(entry.displayName),
                permission: 0,
                group: "Test",
                needs: ["Ja"] as Prisma.JsonArray,
                competence: ["Ja"] as Prisma.JsonArray,
            })
            console.log("User created from LDAP data:" + entry.displayName);
        }
    }));
    if (createData.length > 0) await prisma.user.createMany({ data: createData })
    if (process.env.LDAP_CREATE_LOCAL_ADMIN == "true") {
        if (!process.env.DEFAULT_ADMIN_USERNAME) throw new Error("LDAP_LOCAL_ADMIN_USERNAME is required");
        if (!process.env.DEFAULT_ADMIN_PASSWORD) throw new Error("LDAP_LOCAL_ADMIN_PASSWORD is required");
        const username = process.env.DEFAULT_ADMIN_USERNAME
        const password = process.env.DEFAULT_ADMIN_PASSWORD
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
            console.log("Local Admin created: local/" + username)
        }
    }
    return "LDAP data seeded"
}