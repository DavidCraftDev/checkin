/** @file Provides caching and data access for the WebUntis API data */

import "server-only";
import { unstable_cache } from "next/cache";
import WebUntisService from "./webuntis.service";
import logger from "../logger";
import db from "../db";
import { User } from "@prisma/client";
import { config_data } from "../data/config";
import { isStudyTimeClosed } from "./webuntis.close";

/**
 * The variable to save WebUntisService Instance
 *
 * @type {(WebUntisService | undefined)}
 */
let WebUntisAPI: WebUntisService | undefined;

/**
 * Gets the instance of the WebUntisService
 *
 * @export
 * @returns {WebUntisService} 
 */
export function getWebUntisAPIInstance(): WebUntisService {
    if (!config_data.UNTIS.ENABLE) {
        logger.error("WebUntis API is called but not enabled in the configuration. Please enable it in the config file.", "WebUntis-Caching");
        throw new Error("WebUntis API is called but not enabled in the configuration. Please enable it in the config file.");
    }
    if (!WebUntisAPI) {
        const school = config_data.UNTIS.SCHOOL;
        const username = config_data.UNTIS.USERNAME;
        const password = config_data.UNTIS.PASSWORD;
        const baseUrl = config_data.UNTIS.BASE_URL;
        WebUntisAPI = new WebUntisService(school, username, password, baseUrl);
    }
    return WebUntisAPI;
}

/**
 * Gets the cached timegrid from the WebUntis API
 *
 * @export
 * @returns {Promise<Timegrid[]>}
 */
export const cachedTimegrid = unstable_cache(
    async () => await getWebUntisAPIInstance().getTimegrid(),
    [],
    { revalidate: 900000 }
)

/**
 * Gets the cached teachers from the WebUntis API
 *
 * @export
 * @returns {Promise<Teacher[]>}
 */
export const cachedTeachers = unstable_cache(
    async () => await getWebUntisAPIInstance().getTeachers(),
    [],
    { revalidate: 900000 }
)

/**
 * Holds the last refresh date for each week timetable
 *
 * @export
 * @type {Record<number, Date>}
 */
export const lastTimetableRefresh: Record<string, Date> = {};

/**
 * Gets the cached timetable from the WebUntis API
 *
 * @export
 * @returns {Promise<Timetable[]>}
 */
export const cachedTimetable = unstable_cache(
    async (date: Date, classNumber: number) => {
        lastTimetableRefresh[date.toJSON()] = new Date();
        return await getWebUntisAPIInstance().getTimetable(classNumber, date);
    },
    [],
    { revalidate: 300000 }
)

/**
 * Gets the cached lesson close status from the database
 *
 * @export
 * @returns {Promise<boolean>}
 */
export const cachedLessonCloseStatus = unstable_cache(
    async (lessonID: string) => await isStudyTimeClosed(lessonID),
    [],
    { tags: ["lessonCloseStatus"], revalidate: 300000 }
);

// The following is only temporary placed here until the full rewrite of the CheckIN is done
/**
 * Finds a teacher in the CheckIN database by their display name
 *
 * @async
 * @param {string} teacherDisplayName The display name of the teacher to find
 * @returns {Promise<User | null>} 
 */
async function findCheckINTeacher(teacherDisplayName: string): Promise<User | null> {
    const teacher = await db.user.findMany({
        where: {
            AND: [
                { displayname: teacherDisplayName },
                { permission: { gte: 1 } } // Ensure it's a teacher or higher
            ]
        }
    });
    if (teacher.length === 0) return null;
    if (teacher.length > 1) {
        logger.warn("Multiple teachers found with display name " + teacherDisplayName, "WebUntis-Mapper");
    }
    return teacher[0];
}

/**
 * Gets the cached teacher from the CheckIN database by their display name
 *
 * @export
 * @returns {Promise<User | null>}
 */
export const cachedDBTeacher = unstable_cache(
    async (displayname: string) => await findCheckINTeacher(displayname),
    [],
    { revalidate: 600000 }
);