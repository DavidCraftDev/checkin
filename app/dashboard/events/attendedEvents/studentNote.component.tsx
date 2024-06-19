"use client"

import setStudentNote from "./studentNoteHandler";
import toast from "react-hot-toast";

function StudentNote(attendance: any) {
    let cooldown: number = 0;
    let currentNote: string = ""
    async function setStudentNoteHandler(studentNote: string, attendanceID: any) {
        const data = await setStudentNote(studentNote, attendanceID)
        if (data === "success") {
            toast.success("Notiz erfolgreich gespeichert")
            return
        }
        toast.error("Fehler beim speichern der Notiz")
    }
    async function handleStudentNoteChange(studentNote: string, attendanceID: any) {
        if (cooldown > 0) {
            cooldown = 75
            currentNote = studentNote
            return
        } else {
            cooldown = 75
            currentNote = studentNote
            while (cooldown > 0) {
                cooldown--;
                await new Promise(r => setTimeout(r, 1));
                if (cooldown === 0) {
                    setStudentNoteHandler(currentNote, attendanceID)
                }
            }
        }
    }
    return (
        <td>
            <textarea defaultValue={attendance.attendance.studentNote} onChange={(e) => handleStudentNoteChange(e.target.value, attendance.attendance.id)} placeholder="Schüler Noitz" name="Note" className="border-gray-200 border-2 rounded-md"></textarea>
        </td>
    )
}

export default StudentNote;