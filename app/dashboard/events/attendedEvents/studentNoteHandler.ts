"use server";

import { createStudentNote } from "@/app/src/modules/eventUtilities";

async function setStudentNote(studentNote: string, attendanceID?: any) {
    const data = await createStudentNote(attendanceID, studentNote)
    if (data.studentNote === studentNote) return "success"
    return "error"
}

export default setStudentNote;