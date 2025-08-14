"use server";

import { disabledType, functionResult } from "@/app/src/interfaces/utilties";
import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import db from "@/app/src/modules/db";
import { createStudentNote } from "@/app/src/modules/eventUtilities";
import logger from "@/app/src/modules/logger";
import { createUserStudyTimeNote, saveStudyTimeType } from "@/app/src/modules/studytimeUtilities";
import { Attendances } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function setStudentNote(studentNote: string, attendance: Attendances): Promise<functionResult> {
    const data = await createStudentNote(attendance, studentNote);
    revalidatePath("/dashboard/events/attendedEvents");
    if (data.studentNote === studentNote) {
        logger.debug(`Notiz für ${attendance.id} gespeichert`, "setStudentNote");
        return { success: true };
    }
    logger.error(`Notiz für ${attendance.id} konnte nicht gespeichert werden`, "setStudentNote");
    return { success: false, error: "Notiz konnte nicht gespeichert werden" };
}

const disabledUsers: disabledType = {};
export async function createStudyTimeNote(userID: string, cw: number, year: number): Promise<functionResult> {
    if (disabledUsers[userID] && disabledUsers[userID] + 5000 > Date.now()) {
        revalidatePath("/dashboard/events/attendedEvents");
        return { success: false, warning: "Bitte warte 10 Sekunden" };
    }
    disabledUsers[userID] = Date.now();
    const data = await createUserStudyTimeNote(userID, cw, year);
    const result: functionResult = { success: data };
    if (!result.success) {
        logger.error(`Notiz für ${userID} konnte nicht erstellt werden`, "createStudyTimeNote");
        result.error = "Notiz konnte nicht erstellt werden";
    } else {
        logger.info(`Notiz für ${userID} erstellt`, "createStudyTimeNote");
    }
    delete disabledUsers[userID];
    revalidatePath("/dashboard/events/attendedEvents");
    return result;
}

export async function saveSelectedStudyTimeType(attendance: Attendances, userID: string, type: string): Promise<functionResult> {
    const session = await getCurrentSession();
    if (!session || !session.user) return { success: false, error: "Session not found" };
    if (session.user.id !== userID && session.user.permission < 2) {
        return { success: false, error: "Keine Berechtigung zum Speichern" };
    }
    if (type === "Löschen" && session.user.permission !== 0) {
        db.attendances.delete({
            where: {
                id: attendance.id
            },
        });
    }
    const data = await saveStudyTimeType(attendance, userID, type);
    const result: functionResult = { success: data };
    if (!result.success) {
        logger.error(`Studienzeit Fach für ${attendance.id} konnte nicht gespeichert werden`, "saveSelectedStudyTimeType");
        result.error = "Studienzeit konnte nicht gespeichert werden";
    } else {
        logger.debug(`Studienzeit Fach für ${attendance.id} gespeichert`, "saveSelectedStudyTimeType");
    }
    revalidatePath("/dashboard/events/attendedEvents");
    return result;
}

export async function saveSelfReflection(attendance: Attendances, emoji: string): Promise<functionResult> {
    const session = await getCurrentSession();
    if (!session || !session.user) return { success: false, error: "Session not found" };
    if (session.user.id !== attendance.userID && session.user.permission < 1) {
        return { success: false, error: "Keine Berechtigung zum Speichern" };
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
        logger.error(`Selbstreflexion für ${attendance.id} konnte nicht gespeichert werden: ${error}`, "saveSelfReflection");
        return { success: false, error: "Selbstreflexion konnte nicht gespeichert werden" };
    }

    let result: functionResult = { success: data.selfReflection === emoji };
    if (!result.success) {
        logger.error(`Selbstreflexion für ${attendance.id} konnte nicht gespeichert werden`, "saveSelfReflection");
        result.error = "Selbstreflexion konnte nicht gespeichert werden";
    } else {
        logger.debug(`Selbstreflexion für ${attendance.id} gespeichert`, "saveSelfReflection");
    }
    revalidatePath("/dashboard/events/attendedEvents");
    return result;
}