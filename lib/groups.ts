import "server-only";
import db from "@/lib/db";
import { GroupMember, Groups, GroupsWithUserData } from "@/types/groups";
import { User } from "@prisma/client";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";

dayjs.extend(isoWeek)
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)

export async function getGroupMembers(groupId: string, cw: number, year: number) {
    const users = await db.user.findMany({
        where: {
            groups: {
                has: groupId
            }
        }
    });

    const userIds = users.map(u => u.id);

    // Optimize: Batch count
    const counts = await db.attendance.groupBy({
        by: ['userId'],
        where: {
            userId: { in: userIds },
            cw: cw,
            createdAt: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31")
            }
        },
        _count: true
    });

    const countMap = new Map<string, number>();
    counts.forEach(c => countMap.set(c.userId, c._count));

    const data: GroupMember[] = users.map(user => ({
        user,
        attendances: countMap.get(user.id) || 0
    }));

    data.sort((a, b) => a.user.displayName.localeCompare(b.user.displayName));
    return data;
}

export async function getGroupMemberCount(groupId: string) {
    return db.user.count({
        where: {
            groups: {
                has: groupId
            }
        }
    });
}

export async function getGroups() {
    const users = await db.user.findMany({
        select: { groups: true }
    });

    const groupCounts = new Map<string, number>();

    users.forEach(user => {
        user.groups.forEach(group => {
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
    const allGroups = await getGroups();

    const allUsers = await db.user.findMany();
    const groupUsersMap = new Map<string, User[]>();

    allUsers.forEach(user => {
        user.groups.forEach(group => {
            if (!groupUsersMap.has(group)) groupUsersMap.set(group, []);
            groupUsersMap.get(group)?.push(user);
        });
    });

    const data: GroupsWithUserData[] = allGroups.map(g => ({
        group: g.group,
        members: groupUsersMap.get(g.group) || []
    }));

    return data;
}

export async function getGroupsFromUser(user: User) {
    const data: Groups[] = [];
    for (const group of user.groups) {
        const count = await getGroupMemberCount(group);
        data.push({
            group: group || "Keine Gruppe",
            members: count
        });
    }

    data.sort((a, b) => a.group.localeCompare(b.group));
    return data;
}
