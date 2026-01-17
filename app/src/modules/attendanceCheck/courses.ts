"use server";

import { Event, User } from "@prisma/client";
import { checkDate, getCurrentWeek } from "../date";
import db from "../db";
import { getSessionUser } from "../auth/cookieManager";
import { getUserPerID } from "../userUtilities";

export async function getCreatedAttendanceChecks(courseID: string, calendarWeek: number = getCurrentWeek(), year: number = new Date().getFullYear()): Promise<Event[]> {
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
                { createdAt: { gte: new Date(year, 0, 1), lte: new Date(year + 1, 0, 1) } }
            ]
        }
    });

    // Get teacher data for each attendance check
    // Optimized: using map instead of fetching inside loop
    const teacherIDs = Array.from(new Set(attendanceChecks.map(check => check.userId)));
    const teachers = await db.user.findMany({
        where: { id: { in: teacherIDs } }
    });
    
    // Note: The original code returned just attendanceChecks, but also fetched teachers but didn't return them?
    // The original return type was Promise<Events[]>.
    // I will keep it returning just events as per signature, but logically the teacher fetch seemed useless in original code
    // unless it was populating a cache or something implicit.
    // Wait, `teachersPerAttendanceCheck` was created but not used/returned.
    // I will remove the unused teacher fetching logic to clean up.

    return attendanceChecks;
}
