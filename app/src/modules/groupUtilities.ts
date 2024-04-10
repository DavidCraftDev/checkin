import db from "./db";
import { getAttendanceCountPerUser, getAttendancesPerUser } from "./eventUtilities";

export async function getGroupMembers(groupID: string, cw?: number, year?: number) {
    const userData = await db.user.findMany({
        where: {
            group: groupID
        }
    });
    const data = new Array();
    if (!cw || !year) {
        for (let i = 0; i < userData.length; i++) {
            data.push(userData[i]);
        }
        if (!data) return [] as any;
        return data;
    } else {
        for (let i = 0; i < userData.length; i++) {
            const dataAttendance = await getAttendanceCountPerUser(userData[i].id, cw, year);
            data.push({
                user: userData[i],
                attendances: dataAttendance
            });
        }
    }
    if (!data) return [] as any;
    return data;
}

export async function getGroupMembersWithAttendances(groupID: string, cw: number, year: number) {
    const userData = await db.user.findMany({
        where: {
            group: groupID
        }
    });
    const data = new Array();
    for (let i = 0; i < userData.length; i++) {
        const dataAttendance = await getAttendancesPerUser(userData[i].id, cw, year);
        userData[i].password = ""
        userData[i].loginVersion = 0
        data.push({
            user: userData[i],
            attendances: dataAttendance
        });
    }
    if (!data) return [] as any;
    return data;
}

export async function getGroupMemberCount(groupID: string) {
    const data = await db.user.count({
        where: {
            group: groupID
        }
    });
    if (!data) return 0 as number;
    return data;
}

export async function getGroups() {
    const user = await db.user.findMany();
    let groups = new Set<string>();
    user.forEach((user) => {
        if (!user.group) return;
        groups.add(String(user.group));
    });
    const groupArray = Array.from(groups);
    let data = new Array();
    for (let i = 0; i < groupArray.length; i++) {

        const dataMembers = await getGroupMemberCount(groupArray[i]);
        data.push({
            group: groupArray[i] || "Keine Gruppe",
            members: dataMembers
        });
    }
    if (!data) return [] as any;
    return data;
}

export async function getAllGroups() {
    const groups = await getGroups();
    for (let i = 0; i < groups.length; i++) {
        const dataMembers = await getGroupMembers(groups[i].group);
        groups[i].members = dataMembers;
        for (let j = 0; j < dataMembers.length; j++) {
            groups[i].members[j].password = undefined;
            groups[i].members[j].loginVersion = undefined;
        }
    }
    if (!groups) return [] as any;
    return groups;
}