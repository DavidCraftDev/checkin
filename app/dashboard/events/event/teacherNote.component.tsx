"use client"

import setTeacherNote from "./teacherNoteHandler";
import toast from "react-hot-toast";

function TeacherNote(props: any) {
    let cooldown: number = 0;
    let currentNote: string = ""
    async function setTeacherNoteHandler(teacherNote: string, attendanceID: any) {
        const data = await setTeacherNote(teacherNote, attendanceID)
        if (data === "success") {
            toast.success("Notiz erfolgreich gespeichert")
            return
        }
        toast.error("Fehler beim speichern der Notiz")
    }
    async function handleTeacherNoteChange(teacherNote: string, attendanceID: any) {
        if (cooldown > 0) {
            cooldown = 75
            currentNote = teacherNote
            return
        } else {
            cooldown = 75
            currentNote = teacherNote
            while (cooldown > 0) {
                cooldown--;
                await new Promise(r => setTimeout(r, 1));
                if (cooldown === 0) {
                    setTeacherNoteHandler(currentNote, attendanceID)
                }
            }
        }
    }
    return (
        <td>
            <textarea defaultValue={props.attendance.teacherNote} onChange={(e) => handleTeacherNoteChange(e.target.value, props.attendance.id)} placeholder="Lehrer Notiz" name="Note" className="border-gray-200 border-2 rounded-md"></textarea>
        </td>
    )
}

export default TeacherNote;