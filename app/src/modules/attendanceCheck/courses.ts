"use server";

import { checkDate, getCurrentWeek } from "@/app/src/modules/date";
import db, { Events, User } from "@/app/src/modules/db";
import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { getUserPerID, getUsersByID } from "@/app/src/modules/userUtilities";

export async function getCreatedAttendanceChecks(courseID: string, calendarWeek: number = getCurrentWeek(), year: number = new Date().getFullYear()): Promise<Events[]> {
    // Check if user is allowed to get this data
    const user = await getSessionUser();
    if (user.permission < 1) return [];
    if (user.permission !== 2 && user.courses.find(course => course === courseID) == undefined) return [];

    // Check if date is valid
    if (!checkDate(year, calendarWeek)) return [];

    // Get all attendance checks for the given week and year
    const attendanceChecks = await db.events.findMany({
        where: {
            AND: [
                { type: "check:" + courseID },
                { cw: calendarWeek },
                { created_at: { gte: new Date(year, 0, 1), lte: new Date(year + 1, 0, 1) } }
            ]
        }
    });

    // Get teacher data for each attendance check
    const teacherIDs = new Set<string>();
    const teachersPerAttendanceCheck: { [key: string]: User } = {};

    attendanceChecks.forEach(check => teacherIDs.add(check.user));
    await getUsersByID(Array.from(teacherIDs)).then(users => {
        users.forEach(user => {
            teachersPerAttendanceCheck[user.id] = user;
        });
    });

    return attendanceChecks;
}