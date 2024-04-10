"use server";

import { createStudentNote } from "@/app/src/modules/eventUtilities";

async function setStudentNote(event: FormData, attendanceID?: any) {
    const note: string = String(event.get("Note"))
    const data = await createStudentNote(attendanceID, note)
    if (data.studentNote === note) return "success"
    return "error"
}

export default setStudentNote;