"use server";

import { Attendance, User } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/cookieManager";
import db from "@/lib/db";
import { getCurrentWeek, checkDate } from "@/lib/date";
import { getCourseTypeFromName } from "@/lib/data/courses";
import { TeacherPerEvent } from "@/lib/events";
import { getUserById } from "@/lib/users";

export async function getStudentsPerCourse(courseId: string): Promise<User[]> {
    const user = await getSessionUser();
    if (user.permission < 1) return [];
    if (user.permission !== 2 && !user.courses.includes(courseId)) return [];

    return db.user.findMany({
        where: {
            permission: 0,
            courses: { has: courseId }
        }
    });
}

export type CoursesPerUser = { [course: string]: number };

export async function getCoursesForSessionUser(): Promise<CoursesPerUser> {
    const user = await getSessionUser();
    if (user.permission < 1) return {};

    const courses: CoursesPerUser = {};

    for (const course of user.courses) {
        const students = await db.user.count({
            where: {
                permission: 0,
                courses: { has: course }
            }
        });
        courses[course] = students;
    }

    return courses;
}

export async function getStudyTimeDataPerCourseMember(courseId: string, student: User, calendarWeek: number = getCurrentWeek(), year: number = new Date().getFullYear()): Promise<Attendance | null> {
    const sessionUser = await getSessionUser();
    if (sessionUser.permission < 1) return null;
    if (!student.courses.includes(courseId)) return null;
    if (sessionUser.permission !== 2 && !sessionUser.courses.includes(courseId)) return null;

    if (!checkDate(year, calendarWeek)) return null;

    const subject: string = getCourseTypeFromName(courseId) || courseId;

    const data = await db.attendance.findFirst({
        where: {
            userId: student.id,
            type: { contains: subject },
            cw: calendarWeek,
            createdAt: {
                gte: new Date(year, 0, 1),
                lte: new Date(year, 11, 31)
            }
        },
    });

    return data;
}

export async function getTeachersForEvents(eventIDs: string[]): Promise<TeacherPerEvent> {
    const sessionUser = await getSessionUser();
    if (sessionUser.permission < 1) return {};

    const teachersPerEvent: TeacherPerEvent = {};
    const teachers: { [key: string]: User } = {};

    for (const eventId of eventIDs) {
         // Optimization: use findMany with 'in' if possible, but keeping logic similar for now with caching
        const event = await db.event.findUnique({
            where: { id: eventId },
            select: { creatorId: true } // Changed from user to creatorId
        });

        if (event && event.creatorId) {
             if (teachers[event.creatorId]) {
                teachersPerEvent[eventId] = teachers[event.creatorId];
            } else {
                const teacher = await getUserById(event.creatorId);
                if (teacher) {
                    teachersPerEvent[eventId] = teacher;
                    teachers[event.creatorId] = teacher;
                }
            }
        }
    }

    return teachersPerEvent;
}

export type CourseStudyTimes = { [studentId: string]: Attendance | null };

export async function getStudyTimesDataForAllCourseMembers(courseId: string, students: User[], calendarWeek: number = getCurrentWeek(), year: number = new Date().getFullYear()): Promise<{ studyTimes: CourseStudyTimes, teacherPerEvent: TeacherPerEvent }> {
    const sessionUser = await getSessionUser();
    if (sessionUser.permission < 1) return { studyTimes: {}, teacherPerEvent: {} };
    if (sessionUser.permission !== 2 && !sessionUser.courses.includes(courseId)) return { studyTimes: {}, teacherPerEvent: {} };

    if (!checkDate(year, calendarWeek)) return { studyTimes: {}, teacherPerEvent: {} };

    const studyTimes: CourseStudyTimes = {};

    for (const student of students) {
        const data = await getStudyTimeDataPerCourseMember(courseId, student, calendarWeek, year);
        studyTimes[student.id] = data;
    }

    const eventIDs = new Set<string>();

    Object.values(studyTimes).forEach((attendance) => {
        if (attendance && attendance.eventId && attendance.eventId !== "NOTE") {
            eventIDs.add(attendance.eventId);
        }
    });

    const teacherPerEvent = await getTeachersForEvents(Array.from(eventIDs));

    return { studyTimes, teacherPerEvent };
}
