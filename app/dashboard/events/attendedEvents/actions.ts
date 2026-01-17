"use server";

import { functionResult } from "@/app/src/interfaces/utilties";
import db from "@/app/src/modules/db";
import { createStudentNote as createStudentNoteDB } from "@/app/src/modules/eventUtilities";
import { revalidatePath } from "next/cache";

export async function createStudentNote(note: string, attendanceID: string): Promise<functionResult> {
    const attendance = await db.attendance.findUnique({
        where: { id: attendanceID }
    });
    if (!attendance) return { success: false, error: "Attendance not found" };

    const data = await createStudentNoteDB(attendance, note);
    revalidatePath("/dashboard/events/attendedEvents");
    if (data && data.studentNote === note) return { success: true };
    return { success: false, error: "Notiz konnte nicht gespeichert werden" };
}

export async function setAttendanceType(attendanceID: string, type: string): Promise<functionResult> {
    if (type === "Löschen") {
        await db.attendance.delete({
            where: { id: attendanceID }
        });
        revalidatePath("/dashboard/events/attendedEvents");
        return { success: true };
    }
    const data = await db.attendance.update({
        where: { id: attendanceID },
        data: { type: type }
    });
    revalidatePath("/dashboard/events/attendedEvents");
    if (data && data.type === type) return { success: true };
    return { success: false, error: "Typ konnte nicht gespeichert werden" };
}

export async function setSelfReflection(attendanceID: string, reflection: string): Promise<functionResult> {
    const data = await db.attendance.update({
        where: { id: attendanceID },
        data: { selfReflection: reflection }
    });
    revalidatePath("/dashboard/events/attendedEvents");
    if (data && data.selfReflection === reflection) return { success: true };
    return { success: false, error: "Selbstreflexion konnte nicht gespeichert werden" };
}
