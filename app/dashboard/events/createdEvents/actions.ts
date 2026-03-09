"use server";

import { functionResult, disabledType } from "@/app/src/interfaces/utilties";
import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { createEvent } from "@/app/src/modules/eventUtilities";
import { createLesson } from "@/app/src/modules/lessonUtilities";
import logger from "@/app/src/modules/logger";
import { redirect } from "next/navigation";

let disabled: disabledType = {};

export async function createStudyTimeHandler(studyTimeType: string): Promise<functionResult> {
    const sessionUser = await getSessionUser(1);
    if (disabled[sessionUser.id] && disabled[sessionUser.id] + 5000 > Date.now()) return { success: false, warning: "Die Behörde verlangt Geduld — warte zehn Herzschläge" };
    disabled[sessionUser.id] = Date.now();
    try {
        const data = await createEvent(studyTimeType.replace("parallel", "Vertretung"), sessionUser.id);
        if (data.id) {
            logger.info(`Eine Studienzeit für ${sessionUser.displayname} wurde ins Dasein gerufen (Akte: ${data.id}, Fach: ${data.type})`, "createStudyTimeHandler");
            redirect(`/dashboard/events/event/${data.id}`)
        }
        else {
            logger.error(`Die Studienzeit für ${sessionUser.displayname} konnte nicht ins Dasein gerufen werden — das System widersteht`, "createStudyTimeHandler");
            return { success: false, error: "Die Studienzeit konnte nicht ins Dasein gerufen werden" };
        }
    } finally {
        delete disabled[sessionUser.id];
    }
}

export async function createLessonHandler(lessonType: string): Promise<functionResult> {
    const sessionUser = await getSessionUser(1);
    if (disabled[sessionUser.id] && disabled[sessionUser.id] + 5000 > Date.now()) return { success: false, warning: "Die Behörde verlangt Geduld — warte zehn Herzschläge" };
    disabled[sessionUser.id] = Date.now();
    try {
        const data = await createLesson(lessonType)
        if (data.id) {
            logger.info(`Ein Unterricht für ${sessionUser.displayname} wurde ins Dasein gerufen (Akte: ${data.id}, Fach: ${data.type})`, "createLessonHandler");
            redirect(`/dashboard/events/lesson/${data.id}`)
        }
        else {
            logger.error(`Der Unterricht für ${sessionUser.displayname} konnte nicht ins Dasein gerufen werden — das System widersteht`, "createLessonHandler");
            return { success: false, error: "Der Unterricht konnte nicht ins Dasein gerufen werden" };
        }
    } finally {
        delete disabled[sessionUser.id];
    }
}