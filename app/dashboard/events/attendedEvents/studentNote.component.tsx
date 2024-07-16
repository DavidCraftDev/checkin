"use client"

import { Attendance } from "@prisma/client";
import setStudentNote from "./studentNoteHandler";
import toast from "react-hot-toast";
import { useCallback, useRef } from "react";

interface StudentNoteProps {
    attendance: Attendance;
}

function StudentNote(props: StudentNoteProps) {
    const cooldown = useRef<number>(0);
    const currentNote = useRef<string>("");
    const handleStudentNoteChange = useCallback((studentNote: string, attendanceID: string) => {
        currentNote.current = studentNote;
        if (cooldown.current > 0) {
            cooldown.current = 75;
            return;
        } else {
            cooldown.current = 75;
            const interval = setInterval(async () => {
                cooldown.current--;
                if (cooldown.current <= 0) {
                    clearInterval(interval);
                    const data = await setStudentNote(currentNote.current, attendanceID)
                    if (data === "success") {
                        toast.success("Notiz erfolgreich gespeichert")
                        return
                    }
                    toast.error("Fehler beim speichern der Notiz")
                }
            }, 1);
        }
    }, []);
    return (
        <td>
            <textarea defaultValue={props.attendance.studentNote || ""} onChange={(e) => handleStudentNoteChange(e.target.value, props.attendance.id)} placeholder="Schüler Noitz" name="StudentNote" className="border-gray-200 border-2 rounded-md"></textarea>
        </td>
    )
}

export default StudentNote;