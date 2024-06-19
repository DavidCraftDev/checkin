"use server";

import { createTeacherNote } from "@/app/src/modules/eventUtilities";

async function setTeacherNote(teacherNote: string, attendanceID?: any) {
    const data = await createTeacherNote(attendanceID, teacherNote)
    if (data.teacherNote === teacherNote) return "success"
    return "error"
}

export default setTeacherNote;