import db from "./db";
import { getAttendanceCountPerUser } from "./eventUtilities";

export async function getGroupMembers(groupID: string, cw: number, year: number) {
    const userData = await db.user.findMany({
        where: {
            group: groupID
        }
    });
    const data = new Array();
    for (let i = 0; i < userData.length; i++) {
        const dataAttendance = await getAttendanceCountPerUser(userData[i].id, cw, year);
        data.push({
            user: userData[i],
            attendances: dataAttendance
        });
    }
    if(!data) return [] as any;
    return data;
}

export async function getGroupMemberCount(groupID: string) {
    const data = await db.user.count({
        where: {
            group: groupID
        }
    });
    if(!data) return 0 as number;
    return data;
}

export async function getGroups() {
    const user = await db.user.findMany();
    let groups = new Set<string>();
    user.forEach((user) => {
        if(!user.group) return;
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
    if(!data) return [] as any;
    return data;
}