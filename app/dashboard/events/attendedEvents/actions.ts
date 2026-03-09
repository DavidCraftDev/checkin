"use server";

import { disabledType, functionResult } from "@/app/src/interfaces/utilties";
import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import db, { Attendances } from "@/app/src/modules/db";
import { createStudentNote } from "@/app/src/modules/eventUtilities";
import logger from "@/app/src/modules/logger";
import { createUserStudyTimeNote, saveStudyTimeType } from "@/app/src/modules/studytimeUtilities";
import { revalidatePath } from "next/cache";

export async function setStudentNote(studentNote: string, attendance: Attendances): Promise<functionResult> {
    const data = await createStudentNote(attendance, studentNote);
    revalidatePath("/dashboard/events/attendedEvents");
    if (data.studentNote === studentNote) {
        logger.debug(`Die Notiz für Akte ${attendance.id} wurde in die endlosen Register eingetragen`, "setStudentNote");
        return { success: true };
    }
    logger.error(`Die Notiz für Akte ${attendance.id} wurde vom System zurückgewiesen — die Gründe bleiben im Dunkeln`, "setStudentNote");
    return { success: false, error: "Die Notiz wurde vom System zurückgewiesen — die Gründe bleiben im Dunkeln" };
}

const disabledUsers: disabledType = {};
export async function createStudyTimeNote(userID: string, cw: number, year: number): Promise<functionResult> {
    if (disabledUsers[userID] && disabledUsers[userID] + 5000 > Date.now()) {
        revalidatePath("/dashboard/events/attendedEvents");
        return { success: false, warning: "Die Behörde verlangt Geduld — warte zehn Herzschläge" };
    }
    disabledUsers[userID] = Date.now();
    const data = await createUserStudyTimeNote(userID, cw, year);
    const result: functionResult = { success: data };
    if (!result.success) {
        logger.error(`Die Notiz für Wesen ${userID} konnte nicht ins Dasein gerufen werden`, "createStudyTimeNote");
        result.error = "Die Notiz konnte nicht ins Dasein gerufen werden";
    } else {
        logger.info(`Eine Notiz für Wesen ${userID} wurde ins Dasein gerufen`, "createStudyTimeNote");
    }
    delete disabledUsers[userID];
    revalidatePath("/dashboard/events/attendedEvents");
    return result;
}

export async function saveSelectedStudyTimeType(attendance: Attendances, userID: string, type: string): Promise<functionResult> {
    const session = await getCurrentSession();
    if (!session || !session.user) return { success: false, error: "Deine Sitzung existiert nicht — vielleicht hast du nie existiert" };
    if (session.user.id !== userID && session.user.permission < 2) {
        return { success: false, error: "Die Behörde verweigert dir das Recht zu speichern" };
    }
    if (type === "Löschen" && session.user.permission !== 0) {
        db.attendances.deleteMany({
            where: {
                id: attendance.id
            },
        });
    }
    const data = await saveStudyTimeType(attendance, userID, type);
    const result: functionResult = { success: data };
    if (!result.success) {
        logger.error(`Das Fach der Studienzeit ${attendance.id} wurde vom Register abgelehnt`, "saveSelectedStudyTimeType");
        result.error = "Die Studienzeit wurde vom Register abgelehnt";
    } else {
        logger.debug(`Das Fach der Studienzeit ${attendance.id} wurde in die Akten eingetragen`, "saveSelectedStudyTimeType");
    }
    revalidatePath("/dashboard/events/attendedEvents");
    return result;
}

export async function saveSelfReflection(attendance: Attendances, emoji: string): Promise<functionResult> {
    const session = await getCurrentSession();
    if (!session || !session.user) return { success: false, error: "Deine Sitzung existiert nicht — vielleicht hast du nie existiert" };
    if (session.user.id !== attendance.userID && session.user.permission < 1) {
        return { success: false, error: "Die Behörde verweigert dir das Recht zu speichern" };
    }

    let data;
    try {
        data = await db.attendances.update({
            where: {
                id: attendance.id
            },
            data: {
                selfReflection: emoji
            }
        });
    } catch (error) {
        logger.error(`Die Selbstreflexion für Akte ${attendance.id} scheiterte an unsichtbaren Mächten: ${error}`, "saveSelfReflection");
        return { success: false, error: "Die Selbstreflexion scheiterte — das System verweigert den Blick nach innen" };
    }

    let result: functionResult = { success: data.selfReflection === emoji };
    if (!result.success) {
        logger.error(`Die Selbstreflexion für Akte ${attendance.id} wurde vom System verschluckt`, "saveSelfReflection");
        result.error = "Die Selbstreflexion scheiterte — das System verweigert den Blick nach innen";
    } else {
        logger.debug(`Die Selbstreflexion für Akte ${attendance.id} wurde in die Tiefen der Register versenkt`, "saveSelfReflection");
    }
    revalidatePath("/dashboard/events/attendedEvents");
    return result;
}