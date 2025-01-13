"use server";

import { Entry } from 'ldapts';
import courses from '../data/courses';
import db from '../db';
import LDAP from './ldap';
import { User } from '@prisma/client';
import dayjs from 'dayjs';
import { config_data } from '../data/config';
import logger from '../logger';
import { existsTeacherCompetenceFile, getTeacherCompetenceFile } from '../data/competences';

let client: LDAP

if (config_data.LDAP.ENABLE) client = new LDAP()

export async function search(searchFilter: string) {
    if (!client.isBinded() && !await client.bind(config_data.LDAP.BIND_CREADENTIALS.DN, config_data.LDAP.BIND_CREADENTIALS.PASSWORD)) {
        logger.error("Could not bind to LDAP", "LDAP-Utilities")
        return
    }
    const ldapData = await client.search(searchFilter, config_data.LDAP.SEARCH_BASE)
    ldapData.map((entry) => entry.objectGUID = convertGUIDToString(entry.objectGUID as Buffer));
    return ldapData;
}

export async function getAllUsers() {
    if (!client.isBinded() && !await client.bind(config_data.LDAP.BIND_CREADENTIALS.DN, config_data.LDAP.BIND_CREADENTIALS.PASSWORD)) {
        logger.error("Could not bind to LDAP", "LDAP-Utilities")
        return []
    }
    const ldapData = await client.search(config_data.LDAP.USER_SEARCH_FILTER, config_data.LDAP.SEARCH_BASE)
    ldapData.map((entry) => entry.objectGUID = convertGUIDToString(entry.objectGUID as Buffer));
    await updateUserData(ldapData)
    return ldapData;
}

let lastUpdate: dayjs.Dayjs

async function updateUserData(ldapData: Entry[]) {
    if (lastUpdate && dayjs().diff(lastUpdate, "minute") < 1) return;
    lastUpdate = dayjs();
    const dbData = await db.user.findMany({ where: { password: null } })
    const existUser: Array<string> = new Array()
    await Promise.all(dbData.map(async (entry) => {
        const ldapUser = ldapData.find(e => e.objectGUID === entry.id)
        if (!ldapUser) {
            await db.user.delete({ where: { id: entry.id } })
            logger.info("User Deleted: " + entry.username, "LDAP-Utilities")
            return
        }
        let { permission, groups, needs, competence } = readLDAPUserData(ldapUser, entry)
        if (await existsTeacherCompetenceFile()) {
            const competences = await getTeacherCompetenceFile();
            if (competences) {
                const teacher = competences[entry.username]
                if (teacher) competence = { competence: Array.from(new Set([...competence.competence, ...teacher])) }
            }
        }
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
                pwdLastSet: entry.pwdLastSet ? new Date(Number(entry.pwdLastSet)) : new Date()
            }
        })
        existUser.push(user.id)
    }))
    const newUser = ldapData.filter(e => !existUser.includes(String(e.objectGUID)))
    const createData: any[] = new Array();
    newUser.map(async (entry) => {
        let { permission, groups, needs, competence } = readLDAPUserData(entry);
        if (await existsTeacherCompetenceFile()) {
            const competences = await getTeacherCompetenceFile();
            if (competences) {
                const teacher = competences[String(entry.sAMAccountName).toLowerCase()]
                if (teacher) competence = { competence: Array.from(new Set([...competence.competence, ...teacher])) }
            }
        }
        console.log(entry.pwdLastSet) // As Example: 133746662804606760, is never null
        const number = (Number(entry.pwdLastSet) / 10000) - 11644473600000
        console.log(new Date(Number(number))) // As Example: 1970-01-02T07:57:46.627Z
        createData.push({
            id: String(entry.objectGUID),
            username: String(entry.sAMAccountName).toLowerCase(),
            displayname: String(entry.displayName),
            ...permission,
            ...groups,
            ...needs,
            ...competence,
            pwdLastSet: entry.pwdLastSet ? new Date(Number(entry.pwdLastSet)) : new Date()
        })
        logger.info("User Created: " + entry.sAMAccountName, "LDAP-Utilities");
    })
    await db.user.createMany({ data: createData })
}

function readLDAPUserData(ldapUser: Entry, dbUser?: User) {
    ldapUser.memberOf = ldapUser.memberOf as string[]
    let permission
    if (config_data.LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.ENABLE) {
        permission = { permission: 0 }
        if (ldapUser.memberOf.toString().includes(config_data.LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.ADMIN_GROUP)) permission = { permission: 2 }
        else if (ldapUser.memberOf.toString().includes(config_data.LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.TEACHER_GROUP)) permission = { permission: 1 }
        else permission = { permission: 0 }
    } else permission = {}

    let groups: Array<string> = new Array<string>
    if (config_data.LDAP.AUTOMATIC_DATA_DETECTION.GROUPS.ENABLE) {
        ldapUser.memberOf.map((groupData: string) => {
            let string = groupData.replace(",", "!°SPLIT°!")
            let data = string.split("!°SPLIT°!")
            if (data[1].toLowerCase() == config_data.LDAP.AUTOMATIC_DATA_DETECTION.GROUPS.GROUP_OU.toLowerCase()) groups.push(String(data[0].replace("CN=", "").replace("cn=", "")))
        })
    }

    let needs = { needs: [] as any[] }
    let competence = { competence: [] as any[] }
    if (config_data.LDAP.AUTOMATIC_DATA_DETECTION.STUDYTIME_DATA.ENABLE) {
        let memberData = new Set()
        ldapUser.memberOf.map((groupData: string) => {
            let string = groupData.replace(",", "!°SPLIT°!")
            let data = string.split("!°SPLIT°!")
            if (data[1].toLowerCase() == config_data.LDAP.AUTOMATIC_DATA_DETECTION.STUDYTIME_DATA.STUDYTIME_OU.toLowerCase()) {
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