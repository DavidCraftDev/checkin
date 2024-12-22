"use server";

import { disabledType, functionResult } from "@/app/src/interfaces/utilties";
import { createStudentNote } from "@/app/src/modules/eventUtilities";
import { createUserStudyTimeNote, saveStudyTimeType } from "@/app/src/modules/studytimeUtilities";
import { Attendances } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function setStudentNote(studentNote: string, attendance: Attendances): Promise<functionResult> {
    const data = await createStudentNote(attendance, studentNote);
    revalidatePath("/dashboard/events/attendedEvents");
    if (data.studentNote === studentNote) return { success: true };
    return { success: false, error: "Notiz konnte nicht gespeichert werden" };
}

let disabled: disabledType = {};
export async function createStudyTimeNote(userID: string, cw: number): Promise<functionResult> {
    if (disabled[userID] && disabled[userID] + 5000 > Date.now()) {
        revalidatePath("/dashboard/events/attendedEvents");
        return { success: false, warning: "Bitte warte 10 Sekunden" };
    }
    disabled[userID] = Date.now();
    const data = await createUserStudyTimeNote(userID, cw);
    const result: functionResult = { success: data };
    if (!result.success) result.error = "Notiz konnte nicht erstellt werden";
    delete disabled[userID];
    revalidatePath("/dashboard/events/attendedEvents");
    return result;
}

export async function saveSelectedStudyTimeType(attendanceID: string, userID: string, type: string, searchParamsString: string): Promise<functionResult> {
    const data = await saveStudyTimeType(attendanceID, userID, type);
    const result: functionResult = { success: data };
    if (!result.success) result.error = "Studienzeit konnte nicht gespeichert werden";
    revalidatePath("/dashboard/events/attendedEvents");
    return result;
}