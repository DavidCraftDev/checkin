"use server";

import { Attendances, User } from "@prisma/client";
import { getSessionUser } from "./auth/cookieManager";
import db from "./db";
import { getCurrentWeek, checkDate } from "./date";
import { getCourseFromName } from "./data/courses";

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

export async function getStudyTimePerCourseMember(courseID: string, student: User, calendarWeek: number = getCurrentWeek(), year: number = new Date().getFullYear()): Promise<Attendances[]> {
    // Get user data from session & check if user is allowed to get this data
    const sessionUser = await getSessionUser();
    if (sessionUser.permission < 1) return [];
    if (student.courses.find(course => course === courseID) == undefined) return [];
    if (sessionUser.permission !== 2 && sessionUser.courses.find(course => course === courseID) == undefined) return [];

    // Check if the date is valid
    if (!checkDate(year, calendarWeek)) return [];

    // Get subject of the course
    const subject: string = getCourseFromName(courseID) || courseID;

    // Get study time data for the student in the subject of the course in the given week and year
    const data = await db.attendance.findMany({
        where: {
            AND: [
                { userID: student.id },
                { type: { contains: subject } },
                { cw: calendarWeek },
                {
                    created_at: {
                        gte: new Date(String(year) + "-01-01"),
                        lte: new Date(String(year) + "-12-31")
                    }
                }
            ]
        },
    })
    
    return data || [];
}