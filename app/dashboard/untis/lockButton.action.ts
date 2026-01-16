"use server";

import { getSessionUser } from "@/lib/auth/cookieManager";
import { closeStudyTime } from "@/lib/webuntis/webuntis.close";
import { CloseStudyTimeResult } from "@/lib/webuntis/webuntis.types";

/**
 * Locks a study time lesson via action
 *
 * @export
 * @async
 * @param {string} lessonID  The unique identifier of the lesson from WebUntis
 * @param {string} courseID  The name of the course associated with the lesson
 * @returns {Promise<CloseStudyTimeResult>} 
 */
export async function lockStudyTimeAction(lessonID: string, courseID: string): Promise<CloseStudyTimeResult> {
    const user = await getSessionUser();
    if (!user || user.permission === 0) {
        return 'ERROR';
    }
    return closeStudyTime(lessonID, courseID);
}