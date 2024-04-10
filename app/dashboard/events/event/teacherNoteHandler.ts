"use server";

import { createTeacherNote } from "@/app/src/modules/eventUtilities";

async function setTeacherNote(event: FormData, attendanceID?: any) {
    const note: string = String(event.get("Note"))
    const data = await createTeacherNote(attendanceID, note)
    if (data.teacherNote === note) return "success"
    return "error"
}

export default setTeacherNote;