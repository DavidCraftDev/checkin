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
    if (disabled[sessionUser.id] && disabled[sessionUser.id] + 5000 > Date.now()) return { success: false, warning: "Bitte warte 10 Sekunden" };
    disabled[sessionUser.id] = Date.now();
    try {
        const data = await createEvent(studyTimeType.replace("parallel", "Vertretung"), sessionUser.id);
        if (data.id) {
            logger.info(`Studienzeit für ${sessionUser.displayname} erstellt (ID: ${data.id} Fach: ${data.type})`, "createStudyTimeHandler");
            redirect(`/dashboard/events/event/${data.id}`)
        }
        else {
            logger.error(`Studienzeit für ${sessionUser.displayname} konnte nicht erstellt werden`, "createStudyTimeHandler");
            return { success: false, error: "Studienzeit konnte nicht erstellt werden" };
        }
    } finally {
        delete disabled[sessionUser.id];
    }
}

export async function createLessonHandler(lessonType: string): Promise<functionResult> {
    const sessionUser = await getSessionUser(1);
    if (disabled[sessionUser.id] && disabled[sessionUser.id] + 5000 > Date.now()) return { success: false, warning: "Bitte warte 10 Sekunden" };
    disabled[sessionUser.id] = Date.now();
    try {
        const data = await createLesson(lessonType)
        if (data.id) {
            logger.info(`Unterricht für ${sessionUser.displayname} erstellt (ID: ${data.id} Fach: ${data.type})`, "createLessonHandler");
            redirect(`/dashboard/events/lesson/${data.id}`)
        }
        else {
            logger.error(`Unterricht für ${sessionUser.displayname} konnte nicht erstellt werden`, "createLessonHandler");
            return { success: false, error: "Unterricht konnte nicht erstellt werden" };
        }
    } finally {
        delete disabled[sessionUser.id];
    }
}