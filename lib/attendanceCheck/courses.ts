"use server";

import { Events, User } from "@prisma/client";
import { checkDate, getCurrentWeek } from "../date";
import db from "../db";
import { getSessionUser } from "../auth/cookieManager";
import { getUserPerID } from "../userUtilities";

export async function getCreatedAttendanceChecks(courseID: string, calendarWeek: number = getCurrentWeek(), year: number = new Date().getFullYear()): Promise<Events[]> {
    // Check if user is allowed to get this data
    const user = await getSessionUser();
    if (user.permission < 1) return [];
    if (user.permission !== 2 && user.courses.find(course => course === courseID) == undefined) return [];

    // Check if date is valid
    if (!checkDate(year, calendarWeek)) return [];

    // Get all attendance checks for the given week and year
    const attendanceChecks = await db.event.findMany({
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
    await Promise.all(Array.from(teacherIDs).map(async (teacherID) => {
        const teacher = await getUserPerID(teacherID);
        if (!teacher) return;
        teachersPerAttendanceCheck[teacherID] = teacher;
    }));

    return attendanceChecks;
}