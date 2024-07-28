import { User } from "@prisma/client";
import db from "./db";
import { getAttendanceCountPerUser, getAttendancesPerUser } from "./eventUtilities";
import { saveNeededStudyTimes } from "./studytimeUtilities";
import moment from "moment";
import { GroupMember, GroupMemberWithAttendanceData, Groups, GroupsWithUserData } from "../interfaces/groups";

export async function getGroupMembers(groupID: string, cw: number, year: number) {
    const userData = await db.user.findMany({
        where: {
            group: groupID
        }
    });
    Promise.all(userData.map(async (user: User) => saveNeededStudyTimes(user)));
    const data: GroupMember[] = new Array();
    await Promise.all(userData.map(async (user: User) => {
        const dataAttendance = await getAttendanceCountPerUser(user.id, cw, year);
        data.push({
            user: user,
            attendances: dataAttendance
        });
    }));
    return data;
}

export async function getGroupMembersWithAttendanceData(groupID: string, cw: number, year: number) {
    const userData = await db.user.findMany({
        where: {
            group: groupID
        }
    });
    Promise.all(userData.map(async (user: User) => saveNeededStudyTimes(user)));
    const data: GroupMemberWithAttendanceData[] = new Array();
    await Promise.all(userData.map(async (user: User) => {
        const dataAttendance = await getAttendancesPerUser(user.id, cw, year);
        data.push({
            user: user,
            attendances: dataAttendance
        });
    }));
    return data;
}

export async function getGroupMemberCount(groupID: string) {
    const data = await db.user.count({
        where: {
            group: groupID
        }
    });
    return data;
}

export async function getGroups() {
    const users = await db.user.findMany();
    const groups = new Set<string>();
    users.forEach((user: User) => {
        if (user.group) groups.add(String(user.group));
    });
    const groupArray = Array.from(groups);
    const data: Groups[] = new Array();
    await Promise.all(groupArray.map(async (group: string) => {
        const dataMembers = await getGroupMemberCount(group);
        data.push({
            group: group || "Keine Gruppe",
            members: dataMembers
        });
    }
    ));
    return data;
}

export async function getGroupsWithUserData() {
    const groups = await getGroups();
    const data: GroupsWithUserData[] = new Array();
    await Promise.all(groups.map(async (group: Groups) => {
        const dataMembers = await getGroupMembers(group.group, moment().week(), moment().year());
        data.push({
            group: group.group,
            members: dataMembers.map((member: GroupMember) => member.user)
        });
    }
    ));
    return data;
}