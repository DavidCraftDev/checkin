import { Entry } from 'ldapts';
import { ldap_auto_groups, ldap_auto_groups_ou, ldap_auto_permission, ldap_auto_permission_admin_group, ldap_auto_permission_teacher_group, ldap_auto_studytime_data, ldap_auto_studytime_data_ou, ldap_bind_dn, ldap_bind_password, ldap_search_base, ldap_user_search_filter, studytime, use_ldap } from './config';
import courses from './courses';
import db from './db';
import LDAP from './ldap';
import { User } from '@prisma/client';

let client: LDAP

if (use_ldap) client = new LDAP()

export async function search(searchFilter: string) {
    if (!client.isBinded() && !await client.bind(ldap_bind_dn, ldap_bind_password)) throw new Error("[LDAP-Utilties] Could not bind to LDAP")
    const ldapData = await client.search(searchFilter, ldap_search_base)
    ldapData.map((entry) => entry.objectGUID = convertGUIDToString(entry.objectGUID as Buffer));
    return ldapData;
}

export async function getAllUsers() {
    if (!client.isBinded() && !await client.bind(ldap_bind_dn, ldap_bind_password)) throw new Error("[LDAP-Utilties] Could not bind to LDAP")
    const ldapData = await client.search(ldap_user_search_filter, ldap_search_base)
    ldapData.map((entry) => entry.objectGUID = convertGUIDToString(entry.objectGUID as Buffer));
    await updateUserData(ldapData)
    return ldapData;
}

async function updateUserData(ldapData: Entry[]) {
    const dbData = await db.user.findMany({ where: { password: null } })
    const existUser: Array<string> = new Array()
    await Promise.all(dbData.map(async (entry) => {
        const ldapUser = ldapData.find(e => e.objectGUID === entry.id)
        if (!ldapUser) {
            await db.user.delete({ where: { id: entry.id } })
            console.log("[Info] [LDAP-Utilities] User Deleted: " + entry.username)
            return
        }
        const { permission, groups, needs, competence } = readLDAPUserData(ldapUser, entry)
        const user = await db.user.update({
            where: {
                id: entry.id
            },
            data: {
                username: String(ldapUser.sAMAccountName).toLowerCase(),
                displayname: String(ldapUser.displayName),
                ...permission,
                ...groups,
                ...needs,
                ...competence,
                loginVersion: Math.ceil(Number(ldapUser.pwdLastSet) / 10000000000)
            }
        })
        existUser.push(user.id)
    }))
    const newUser = ldapData.filter(e => !existUser.includes(String(e.objectGUID)))
    const createData: any[] = new Array();
    newUser.map((entry) => {
        const { permission, groups, needs, competence } = readLDAPUserData(entry)
        createData.push({
            id: String(entry.objectGUID),
            username: String(entry.sAMAccountName).toLowerCase(),
            displayname: String(entry.displayName),
            ...permission,
            ...groups,
            ...needs,
            ...competence,
            loginVersion: Math.ceil(Number(entry.pwdLastSet) / 10000000000)
        })
        console.log("[Info] [LDAP-Utilities] User Created: " + entry.sAMAccountName)
    })
    await db.user.createMany({ data: createData })
}

function readLDAPUserData(ldapUser: Entry, dbUser?: User) {
    ldapUser.memberOf = ldapUser.memberOf as string[]
    let permission
    if (ldap_auto_permission) {
        permission = { permission: 0 }
        if (ldapUser.memberOf.toString().includes(ldap_auto_permission_admin_group)) permission = { permission: 2 }
        else if (ldapUser.memberOf.toString().includes(ldap_auto_permission_teacher_group)) permission = { permission: 1 }
        else permission = { permission: 0 }
    } else permission = {}

    let groups: Array<string> = new Array<string>
    if (ldap_auto_groups) {
        ldapUser.memberOf.map((groupData: string) => {
            let string = groupData.replace(",", "!°SPLIT°!")
            let data = string.split("!°SPLIT°!")
            if (data[1].toLowerCase() == ldap_auto_groups_ou.toLowerCase()) groups.push(String(data[0].replace("CN=", "").replace("cn=", "")))
        })
    }

    let needs = {}
    let competence = {}
    if (ldap_auto_studytime_data && studytime) {
        let memberData = new Set()
        ldapUser.memberOf.map((groupData: string) => {
            let string = groupData.replace(",", "!°SPLIT°!")
            let data = string.split("!°SPLIT°!")
            if (data[1].toLowerCase() == ldap_auto_studytime_data_ou.toLowerCase()) {
                const splitedName = data[0].replace("CN=", "").replace("cn=", "").split(" ")
                if (splitedName[0].startsWith("EF") || splitedName[0].startsWith("Q1") || splitedName[0].startsWith("Q2")) {
                    if (courses[splitedName[1].toUpperCase()]) memberData.add(courses[splitedName[1].toUpperCase()] as string)
                }
            }
        })
        if ((permission.permission && permission.permission >= 1) || (dbUser && dbUser.permission >= 1)) {
            competence = { competence: Array.from(memberData) }
            needs = { needs: [] }
        } else {
            needs = { needs: Array.from(memberData) }
            competence = { competence: [] }
        }
    }
    const groupData = { group: groups }
    return { permission, groups: groupData, needs, competence }
}

function convertGUIDToString(guidRaw: Buffer) {
    const hex = (guidRaw as Buffer).toString("hex")
    let formattedGUID = `${hex.substring(6, 8)}${hex.substring(4, 6)}${hex.substring(2, 4)}${hex.substring(0, 2)}-` +
        `${hex.substring(10, 12)}${hex.substring(8, 10)}-` +
        `${hex.substring(14, 16)}${hex.substring(12, 14)}-` +
        `${hex.substring(16, 20)}-` +
        `${hex.substring(20)}`
    return formattedGUID;
}
