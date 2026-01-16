"use server";

import { functionResult } from "@/types/utilties";
import db from "@/lib/db";
import { createTeacherNote } from "@/lib/events";
import { revalidatePath } from "next/cache";

export async function setTeacherNote(teacherNote: string, attendanceID: string): Promise<functionResult> {
    const data = await createTeacherNote(attendanceID, teacherNote);
    revalidatePath("/dashboard/events/attendedEvents");
    if (data && data.teacherNote === teacherNote) return { success: true };
    return { success: false, error: "Notiz konnte nicht gespeichert werden" };
}

export async function setAttendanceStatus(attendanceID: string, status: boolean): Promise<functionResult> {
    const data = await db.attendance.update({
        where: {
            id: attendanceID
        },
        data: {
            attended: status
        }
    });
    revalidatePath("/dashboard/events/attendedEvents");
    if (data && data.attended === status) return { success: true };
    return { success: false, error: "Status konnte nicht gespeichert werden" };
}