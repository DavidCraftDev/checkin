/** @file Provides to get locked study times and locked study times from our database */

import "server-only";
import db from "../db";
import { CloseStudyTimeResult } from "./webuntis.types";

/**
 * Checks if a study time lesson is closed in the database.
 *
 * @export
 * @async
 * @param {string} lessonID The id of the lesson from WebUntis
 * @returns {Promise<boolean>} Returns true if the study time is closed, false otherwise
 */
export async function isStudyTimeClosed(lessonID: string): Promise<boolean> {
    const lockedStudyTime = await db.closedStudyTimes.findUnique({
        where: {
            lessonID: lessonID
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
    // Check if the lessons is already closed
    const alreadyClosed = await isStudyTimeClosed(lessonID);
    if (alreadyClosed) {
        return 'ALREADY_CLOSED';
    }

    // Check limit per course (max 6)
    const lockCount = await db.closedStudyTimes.count({
        where: {
            courseID: courseID
        }
    });
    if (lockCount >= 6) {
        return 'LIMIT_EXCEEDED';
    }

    // Lock the study time lesson
    const result = await db.closedStudyTimes.create({
        data: {
            lessonID: lessonID,
            courseID: courseID
        }
    });
    if (result.courseID === courseID && result.lessonID === lessonID) {
        return 'SUCCESS';
    }
    return 'ERROR';
}