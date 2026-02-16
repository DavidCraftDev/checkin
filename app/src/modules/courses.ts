"use server";

import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import db, { Attendances, User } from "./db";
import { getCurrentWeek, checkDate } from "./date";
import { getCourseTypeFromName } from "@/app/src/modules/data/courses";
import { TeacherPerEvent } from "./eventUtilities";
import { getUsersByID } from "./userUtilities";

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

    // Initialize counts to 0
    user.courses.forEach(course => courses[course] = 0);

    if (user.courses.length > 0) {
        // Fetch all students which are in these courses in one query
        const students = await db.user.findMany({
            where: {
                AND: [
                    { permission: 0 },
                    { courses: { hasSome: user.courses } }
                ]
            },
            select: {
                courses: true
            }
        });

        // Count locally
        students.forEach(student => {
            student.courses.forEach(c => {
                if (courses[c] !== undefined) {
                    courses[c]++;
                }
            });
        });
    }

    return courses;
}

export async function getTeachersForEvents(eventIDs: string[]): Promise<TeacherPerEvent> {
    // Check if the user is allowed to get this data
    const sessionUser = await getSessionUser();
    if (sessionUser.permission < 1) return {};

    // Initialize object to store teacher data and a object to dont get the same teacher twice
    const teachersPerEvent: TeacherPerEvent = {};

    // Get teacher for each eventID
    const events = await db.events.findMany({
        where: {
            id: { in: eventIDs }
        },
        select: {
            id: true,
            user: true
        }
    });

    // Get all teachers at once
    if(events.length === 0) return {};
    const teacherIDs = Array.from(new Set(events.map(event => event.user)));
    const teachers = await getUsersByID(teacherIDs);
    const teachersMap = new Map(teachers.map(teacher => [teacher.id, teacher]));

    events.forEach(event => {
        const teacher = teachersMap.get(event.user);
        if (teacher) {
            teachersPerEvent[event.id] = teacher;
        }
    });

    return teachersPerEvent;
}

export type CourseStudyTimes = { [courseID: string]: Attendances };

export async function getStudyTimesDataForAllCourseMembers(courseID: string, students: User[], calendarWeek: number = getCurrentWeek(), year: number = new Date().getFullYear()): Promise<{ studyTimes: CourseStudyTimes, teacherPerEvent: TeacherPerEvent }> {
    // Get user data from session & check if user is allowed to get this data
    const sessionUser = await getSessionUser();
    if (sessionUser.permission < 1) return { studyTimes: {}, teacherPerEvent: {} };
    if (sessionUser.permission !== 2 && sessionUser.courses.find(course => course === courseID) == undefined) return { studyTimes: {}, teacherPerEvent: {} };

    // Check if the date is valid
    if (!checkDate(year, calendarWeek)) return { studyTimes: {}, teacherPerEvent: {} };

    const subject: string = getCourseTypeFromName(courseID) || courseID;

    // Initialize object to store study time data for each student
    const studyTimes: CourseStudyTimes = {};

    const allAttendances = await db.attendances.findMany({
        where: {
            userID: { in: students.map(s => s.id) },
            type: { contains: subject },
            cw: calendarWeek,
            created_at: {
                gte: new Date(year, 0, 1),
                lte: new Date(year, 11, 31)
            }
        },
    });

    // Create a map for faster lookup
    const attendanceMap = new Map(allAttendances.map(a => [a.userID, a]));

    students.forEach((student) => {
        if (student.courses.find(c => c === courseID) == undefined) {
            studyTimes[student.id] = {} as Attendances;
            return;
        }
        const data = attendanceMap.get(student.id);
        studyTimes[student.id] = data || {} as Attendances;
    });

    // Initialize Set to store event IDs
    const eventIDs = new Set<string>();

    // Get eventIDs from the attendances
    Object.values(studyTimes).forEach((attendance) => {
        if (attendance.eventID && attendance.eventID !== "NOTE") {
            eventIDs.add(attendance.eventID);
        }
    });

    // Get teacher from each eventID
    const teacherPerEvent = await getTeachersForEvents(Array.from(eventIDs));

    return { studyTimes, teacherPerEvent };
}