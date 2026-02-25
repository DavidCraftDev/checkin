import "server-only";

import db, { User } from "./db";
import { getAttendanceCountPerUser } from "./eventUtilities";
import { GroupMember, Groups, GroupsWithUserData } from "@/app/src/interfaces/groups";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";

dayjs.extend(isoWeek)
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)

export async function getGroupMembers(groupID: string, cw: number, year: number) {
    const userData = await db.user.findMany({
        where: {
            group: {
                has: groupID
            }
        }
    });
    const data: GroupMember[] = [];
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
    const groupCounts = new Map<string, number>();

    users.forEach((user) => {
        user.group.forEach((group) => {
            groupCounts.set(group, (groupCounts.get(group) || 0) + 1);
        });
    });

    const data: Groups[] = Array.from(groupCounts.entries()).map(([group, count]) => ({
        group: group || "Keine Gruppe",
        members: count
    }));

    data.sort((a, b) => a.group.localeCompare(b.group));
    return data;
}

export async function getGroupsWithUserData() {
    const groups = await getGroups();
    const data: GroupsWithUserData[] = [];
    await Promise.all(groups.map(async (group) => {
        const dataMembers = await getGroupMembers(group.group, dayjs().isoWeek(), dayjs().year());
        data.push({
            group: group.group,
            members: dataMembers.map((member) => member.user)
        });
    }
    ));
    return data;
}

export async function getGroupsFromUser(user: User) {
    const data: Groups[] = [];
    await Promise.all(user.group.map(async (group) => {
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