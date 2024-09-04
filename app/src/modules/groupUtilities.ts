import db from "./db";
import { getAttendanceCountPerUser } from "./eventUtilities";
import { saveNeededStudyTimes } from "./studytimeUtilities";
import moment from "moment";
import { GroupMember, Groups, GroupsWithUserData } from "../interfaces/groups";

export async function getGroupMembers(groupID: string, cw: number, year: number) {
    const userData = await db.user.findMany({
        where: {
            group: {
                has: groupID
            }
        }
    });
    Promise.all(userData.map(async (user) => saveNeededStudyTimes(user)));
    const data: GroupMember[] = new Array();
    await Promise.all(userData.map(async (user) => {
        const dataAttendance = await getAttendanceCountPerUser(user.id, cw, year);
        data.push({
            user: user,
            attendances: dataAttendance
        });
    }));
    data.sort((a, b) => a.user.displayname.localeCompare(b.user.displayname));
    return data;
}

export async function getGroupMemberCount(groupID: string) {
    const data = await db.user.count({
        where: {
            group: {
                has: groupID
            }
        }
    });
    return data;
}

export async function getGroups() {
    const users = await db.user.findMany();
    const groups = new Set<string>();
    users.forEach((user) => user.group.forEach((group) => groups.add(group)));
    const groupArray = Array.from(groups);
    const data: Groups[] = new Array();
    await Promise.all(groupArray.map(async (group) => {
        const dataMembers = await getGroupMemberCount(group);
        data.push({
            group: group || "Keine Gruppe",
            members: dataMembers
        });
    }
    ));
    data.sort((a, b) => a.group.localeCompare(b.group));
    return data;
}

export async function getGroupsWithUserData() {
    const groups = await getGroups();
    const data: GroupsWithUserData[] = new Array();
    await Promise.all(groups.map(async (group) => {
        const dataMembers = await getGroupMembers(group.group, moment().isoWeek(), moment().year());
        data.push({
            group: group.group,
            members: dataMembers.map((member) => member.user)
        });
    }
    ));
    return data;
}