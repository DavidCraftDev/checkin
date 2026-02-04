"use server";

import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import db, { Attendances, User } from "./db";
import { getCurrentWeek, checkDate } from "./date";
import { getCourseTypeFromName } from "@/app/src/modules/data/courses";
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

export async function getStudyTimeDataPerCourseMember(courseID: string, student: User, calendarWeek: number = getCurrentWeek(), year: number = new Date().getFullYear()): Promise<Attendances> {
    // Get user data from session & check if user is allowed to get this data
    const sessionUser = await getSessionUser();
    if (sessionUser.permission < 1) return {} as Attendances;
    if (student.courses.find(course => course === courseID) == undefined) return {} as Attendances;
    if (sessionUser.permission !== 2 && sessionUser.courses.find(course => course === courseID) == undefined) return {} as Attendances;

    // Check if the date is valid
    if (!checkDate(year, calendarWeek)) return {} as Attendances;

    // Get subject of the course
    const subject: string = getCourseTypeFromName(courseID) || courseID;

    // Get study time data for the student in the subject of the course in the given week and year
    const data = await db.attendances.findMany({
        where: {
            AND: [
                { userID: student.id },
                { type: { contains: subject } },
                { cw: calendarWeek },
                {
                    created_at: {
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
    await Promise.all(eventIDs.map(async (eventID) => {
        const teacherID = await db.events.findUnique({
            where: {
                id: eventID
            },
            select: {
                user: true
            }
        });
        if (teacherID) {
            if (teachers[teacherID.user]) {
                teachersPerEvent[eventID] = teachers[teacherID.user];
            } else {
                const teacher = await getUserPerID(teacherID.user);
                if (teacher) {
                    teachersPerEvent[eventID] = teacher;
                    teachers[teacherID.user] = teacher; // Store the teacher in the object to avoid duplicate queries
                }
            }
        }
    }))

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

    // Initialize object to store study time data for each student
    const studyTimes: CourseStudyTimes = {};

    // Get study time data for each student in the subject of the course in the given week and year
    await Promise.all(students.map(async (student) => {
        const data = await getStudyTimeDataPerCourseMember(courseID, student, calendarWeek, year);
        if (data) {
            studyTimes[student.id] = data;
        } else {
            studyTimes[student.id] = {} as Attendances;
        }
    }))

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