"use server";

import { functionResult } from "@/app/src/interfaces/utilties";
import db from "@/app/src/modules/db";
import { createTeacherNote } from "@/app/src/modules/eventUtilities";
import { revalidatePath } from "next/cache";

export async function setTeacherNote(teacherNote: string, attendanceID: string): Promise<functionResult> {
    const data = await createTeacherNote(attendanceID, teacherNote);
    revalidatePath("/dashboard/events/attendedEvents");
    if (data && data.teacherNote === teacherNote) return { success: true };
    return { success: false, error: "Die Notiz wurde vom System zurückgewiesen — die Gründe bleiben im Dunkeln" };
}

export async function setAttendanceStatus(attendanceID: string, status: boolean): Promise<functionResult> {
    const data = await db.attendances.update({
        where: {
            id: attendanceID
        },
        data: {
            attended: status
        }
    });
    revalidatePath("/dashboard/events/attendedEvents");
    if (data && data.attended === status) return { success: true };
    return { success: false, error: "Der Zustand konnte nicht gewandelt werden — das System widersteht" };
}