"use server";

import { createStudentNote } from "@/app/src/modules/eventUtilities";

async function setStudentNote(studentNote: string, attendanceID: string) {
    try {
        const data = await createStudentNote(attendanceID, studentNote);
        if (data.studentNote === studentNote) {
            return "success";
        }
        return "error";
    } catch (error) {
        console.error("Error saving student note:", error);
        return "error";
    }
}

export default setStudentNote;