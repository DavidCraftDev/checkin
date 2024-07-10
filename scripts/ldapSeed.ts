import { default_password, default_username, ldap_auto_groups, ldap_auto_groups_ou, ldap_auto_permission, ldap_auto_permission_admin_group, ldap_auto_permission_teacher_group, ldap_auto_studytime_data, ldap_auto_studytime_data_ou, ldap_create_local_admin, studytime } from "../app/src/modules/config";
import courses from "../app/src/modules/courses";
import { getAllUsers } from "../app/src/modules/ldap";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

export async function seedLdapData(prisma: PrismaClient) {
    const ldapData: any[] = await getAllUsers()
    const ldapUser: any[] = await prisma.user.findMany({ where: { password: null } })
    const exist: Array<string> = []
    await Promise.all(ldapUser.map(async (entry) => {
        const ldapUserData = ldapData.find(e => e.objectGUID === entry.id)
        console.log(ldapUserData)
        if (!ldapUserData) {
            await prisma.user.delete({ where: { id: entry.id } })
            return
        }
        let permission = {}
        if (ldap_auto_permission) {
            if (ldapUserData.memberOf.includes(ldap_auto_permission_admin_group)) permission = { permission: 2 }
            else if (ldapUserData.memberOf.includes(ldap_auto_permission_teacher_group)) permission = { permission: 1 }
            else permission = { permission: 0 }
        } else {
            permission = { permission: 0 }
        }
        let group = {}
        if (ldap_auto_groups) {
            Promise.all(ldapUserData.memberOf.map(async (groupData: string) => {
                let string = groupData.replace(",", "!°SPLIT°!")
                let data = string.split("!°SPLIT°!")
                if (data[1].toLowerCase() == ldap_auto_groups_ou.toLowerCase()) {
                    group = { group: String(data[0].replace("CN=", "").replace("cn=", "")) }
                }
            }))
        }
        let needs = {}
        let competence = {}
        if (ldap_auto_studytime_data && studytime) {
            let needsData = new Set()
            Promise.all(ldapUserData.memberOf.map(async (groupData: string) => {
                let string = groupData.replace(",", "!°SPLIT°!")
                let data = string.split(",")
                console.log(data)
                if (data[1].toLowerCase() == ldap_auto_studytime_data_ou.toLowerCase()) {
                    const splitedName = data[0].replace("CN=", "").replace("cn=", "").split(" ")
                    if (splitedName[0].startsWith("EF") || splitedName[0].startsWith("Q1") || splitedName[0].startsWith("Q2")) {
                        if (courses[splitedName[1].toUpperCase()]) needsData.add(courses[splitedName[1].toUpperCase()] as string)
                    }
                }
            }))
            needs = { needs: Array.from(needsData) }
            let competenceData = new Set()
            if (Array.isArray(ldapUserData.managedObjects)) {
                Promise.all(ldapUserData.managedObjects.map(async (groupData: string) => {
                    let string = groupData.replace(",", "!°SPLIT°!")
                    let data = string.split(",")
                    if (data[1].toLowerCase() == ldap_auto_studytime_data_ou.toLowerCase()) {
                        const splitedName = data[0].replace("CN=", "").replace("cn=", "").split(" ")
                        if (splitedName[0].startsWith("EF") || splitedName[0].startsWith("Q1") || splitedName[0].startsWith("Q2")) {
                            if (courses[splitedName[1].toUpperCase()]) competenceData.add(courses[splitedName[1].toUpperCase()] as string)
                        }
                    }
                }))
            }
            competence = { competence: Array.from(competenceData) }
        }
        console.log(needs, competence)
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
    }));
    const createData: any[] = []
    await Promise.all(ldapData.map(async (entry) => {
        if (!exist.includes(entry.objectGUID)) {
            let permission = {}
            if (ldap_auto_permission) {
                if (entry.memberOf.includes(ldap_auto_permission_admin_group)) permission = { permission: 2 }
                else if (entry.memberOf.includes(ldap_auto_permission_teacher_group)) permission = { permission: 1 }
                else permission = { permission: 0 }
            } else {
                permission = { permission: 0 }
            }
            let group = {}
            if (ldap_auto_groups) {
                Promise.all(entry.memberOf.map(async (groupData: string) => {
                    let data = groupData.split(",")
                    if (data[1].replace("OU=", "") == ldap_auto_groups_ou) {
                        group = { group: String(data[0].replace("CN=", "")) }
                    }
                }))
            }
            let needs = {}
            let competence = {}
            if (ldap_auto_studytime_data && studytime) {
                let needsData = new Set()
                Promise.all(entry.memberOf.map(async (groupData: string) => {
                    let string = groupData.replace(",", "!°SPLIT°!")
                    let data = string.split(",")
                    if (data[1].toLowerCase() == ldap_auto_studytime_data_ou.toLowerCase()) {
                        const splitedName = data[0].replace("CN=", "").replace("cn=", "").split(" ")
                        if (splitedName[0].startsWith("EF") || splitedName[0].startsWith("Q1") || splitedName[0].startsWith("Q2")) {
                            if (courses[splitedName[1].toUpperCase()]) needsData.add(courses[splitedName[1].toUpperCase()] as string)
                        }
                    }
                }))
                needs = { needs: Array.from(needsData) }
                let competenceData = new Set()
                if (Array.isArray(entry.managedObjects)) {
                    Promise.all(entry.managedObjects.map(async (groupData: string) => {
                        let string = groupData.replace(",", "!°SPLIT°!")
                        let data = string.split(",")
                        if (data[1].toLowerCase() == ldap_auto_studytime_data_ou.toLowerCase()) {
                            const splitedName = data[0].replace("CN=", "").replace("cn=", "").split(" ")
                            if (splitedName[0].startsWith("EF") || splitedName[0].startsWith("Q1") || splitedName[0].startsWith("Q2")) {
                                if (courses[splitedName[1].toUpperCase()]) competenceData.add(courses[splitedName[1].toUpperCase()] as string)
                            }
                        }
                    }))
                }
                competence = { competence: Array.from(competenceData) }
            }
            createData.push({
                id: entry.objectGUID,
                username: String(entry.sAMAccountName).toLowerCase(),
                displayname: String(entry.displayName),
                ...permission,
                ...group,
                ...needs,
                ...competence
            })
        }
    }));
    if (createData.length > 0) await prisma.user.createMany({ data: createData })
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
            console.log("Local Admin created: local/" + username)
        }
    }
    console.log("LDAP data seeded successfully!")
    return
}
