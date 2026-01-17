/** @file Provides functions to get and manage locked study times from our database */

import "server-only";
import db from "../db";
import { CloseStudyTimeResult } from "./webuntis.types";
import { revalidateTag } from "next/cache";

/**
 * Checks if a study time lesson is closed in the database.
 *
 * @export
 * @async
 * @param {string} lessonID The id of the lesson from WebUntis
 * @returns {Promise<boolean>} Returns true if the study time is closed, false otherwise
 */
export async function isStudyTimeClosed(lessonID: string): Promise<boolean> {
    const lockedStudyTime = await db.closedStudyTime.findUnique({
        where: {
            lessonId: lessonID
        }
    });
    return lockedStudyTime !== null;
}

/**
 * Locks a study time lesson in the database.
 *
 * @export
 * @async
 * @param {string} lessonID The id of the lesson from WebUntis
 * @param {string} courseID The id of the course associated with the lesson
 * @returns {Promise<CloseStudyTimeResult>} The result of the close operation
 */
export async function closeStudyTime(lessonID: string, courseID: string): Promise<CloseStudyTimeResult> {
    // Check if the lesson is already closed
    const alreadyClosed = await isStudyTimeClosed(lessonID);
    if (alreadyClosed) {
        return 'ALREADY_CLOSED';
    }

    // Check limit per course (max 6)
    const lockCount = await db.closedStudyTime.count({
        where: {
            courseId: courseID
        }
    });
    if (lockCount >= 6) {
        return 'LIMIT_EXCEEDED';
    }

    // Lock the study time lesson
    const result = await db.closedStudyTime.create({
        data: {
            lessonId: lessonID,
            courseId: courseID
        }
    });

    // Revalidate cache
    revalidateTag("lessonCloseStatus");

    if (result.courseId === courseID && result.lessonId === lessonID) {
        return 'SUCCESS';
    }
    return 'ERROR';
}
