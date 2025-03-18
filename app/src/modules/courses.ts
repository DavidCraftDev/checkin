"use server";

import { User } from "@prisma/client";
import { getSessionUser } from "./auth/cookieManager";
import db from "./db";

export async function getStudentsPerCourse(courseID: string): Promise<User[]> {
    // Check if user is allowed to get this data
    const user = await getSessionUser();
    if(user.permission < 1) return [];
    if(user.permission !== 2 && user.courses.find(course => course === courseID) == undefined) return [];

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
    if(user.permission < 1) return {};

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