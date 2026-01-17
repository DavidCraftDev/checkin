"use server";

import { Attendance, User } from "@prisma/client";
import { getSessionUser } from "./auth/cookieManager";
import db from "./db";
import { getCurrentWeek, checkDate } from "./date";
import { getCourseTypeFromName } from "./data/courses";
import { TeacherPerEvent } from "./eventUtilities";
import { getUserPerID } from "./userUtilities";

export async function getStudentsPerCourse(courseID: string): Promise<User[]> {
    // Check if user is allowed to get this data
    const user = await getSessionUser();
    if (user.permission < 1) return [];
    if (user.permission !== 2 && user.courses.find(course => course === courseID) == undefined) return [];

    // Get all students in course
    const data = db.user.findMany({
        where: {
            AND: [
                { permission: 0 },
                { courses: { has: courseID } }
            ]
        }
    });

    return data;
}

export type CoursesPerUser = { [course: string]: number };

export async function getCoursesForSessionUser(): Promise<CoursesPerUser> {
    // Get user data from session & check if user is allowed to get this data
    const user = await getSessionUser();
    if (user.permission < 1) return {};

    // Initialize object to store course data
    const courses: CoursesPerUser = {};

    // Get student count for each course
    await Promise.all(user.courses.map(async (course) => {
        const students = await db.user.count({
            where: {
                AND: [
                    { permission: 0 },
                    { courses: { has: course } }
                ]
            }
        });
        courses[course] = students;
    }));

    return courses;
}

export async function getStudyTimeDataPerCourseMember(courseID: string, student: User, calendarWeek: number = getCurrentWeek(), year: number = new Date().getFullYear()): Promise<Attendance> {
    // Get user data from session & check if user is allowed to get this data
    const sessionUser = await getSessionUser();
    if (sessionUser.permission < 1) return {} as Attendance;
    if (student.courses.find(course => course === courseID) == undefined) return {} as Attendance;
    if (sessionUser.permission !== 2 && sessionUser.courses.find(course => course === courseID) == undefined) return {} as Attendance;

    // Check if the date is valid
    if (!checkDate(year, calendarWeek)) return {} as Attendance;

    // Get subject of the course
    const subject: string = getCourseTypeFromName(courseID) || courseID;

    // Get study time data for the student in the subject of the course in the given week and year
    const data = await db.attendance.findMany({
        where: {
            AND: [
                { userId: student.id },
                { type: { contains: subject } },
                { cw: calendarWeek },
                {
                    createdAt: {
                        gte: new Date(year, 0, 1),
                        lte: new Date(year, 11, 31)
                    }
                }
            ]
        },
    })

    return data[0] || {};
}

export async function getTeachersForEvents(eventIDs: string[]): Promise<TeacherPerEvent> {
    // Check if the user is allowed to get this data
    const sessionUser = await getSessionUser();
    if (sessionUser.permission < 1) return {};

    // Initialize object to store teacher data and a object to dont get the same teacher twice
    const teachersPerEvent: TeacherPerEvent = {};
    const teachers: { [key: string]: User } = {};

    // Get teacher for each eventID
    const events = await db.event.findMany({
        where: { id: { in: eventIDs } },
        select: { id: true, userId: true }
    });

    for (const event of events) {
        if (teachers[event.userId]) {
            teachersPerEvent[event.id] = teachers[event.userId];
        } else {
             const teacher = await getUserPerID(event.userId);
             if (teacher) {
                 teachersPerEvent[event.id] = teacher;
                 teachers[event.userId] = teacher;
             }
        }
    }

    return teachersPerEvent;
}

export type CourseStudyTimes = { [courseID: string]: Attendance };

export async function getStudyTimesDataForAllCourseMembers(courseID: string, students: User[], calendarWeek: number = getCurrentWeek(), year: number = new Date().getFullYear()): Promise<{ studyTimes: CourseStudyTimes, teacherPerEvent: TeacherPerEvent }> {
    // Get user data from session & check if user is allowed to get this data
    const sessionUser = await getSessionUser();
    if (sessionUser.permission < 1) return { studyTimes: {}, teacherPerEvent: {} };
    if (sessionUser.permission !== 2 && sessionUser.courses.find(course => course === courseID) == undefined) return { studyTimes: {}, teacherPerEvent: {} };

    // Check if the date is valid
    if (!checkDate(year, calendarWeek)) return { studyTimes: {}, teacherPerEvent: {} };

    // Initialize object to store study time data for each student
    const studyTimes: CourseStudyTimes = {};

    // Get study time data for each student in the subject of the course in the given week and year
    // Optimized: instead of looping, could fetch all at once, but keeping logic structure similar for now to avoid logic drift
    // Ideally this should be a single query

    await Promise.all(students.map(async (student) => {
        const data = await getStudyTimeDataPerCourseMember(courseID, student, calendarWeek, year);
        if (data && data.id) {
            studyTimes[student.id] = data;
        } else {
            studyTimes[student.id] = {} as Attendance;
        }
    }))

    // Initialize Set to store event IDs
    const eventIDs = new Set<string>();

    // Get eventIDs from the attendances
    Object.values(studyTimes).forEach((attendance) => {
        if (attendance.eventId && attendance.eventId !== "NOTE") {
            eventIDs.add(attendance.eventId);
        }
    });

    // Get teacher from each eventID
    const teacherPerEvent = await getTeachersForEvents(Array.from(eventIDs));

    return { studyTimes, teacherPerEvent };
}
