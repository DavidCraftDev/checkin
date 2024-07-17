"use client"

import { Attendance } from "@prisma/client";
import setTeacherNote from "./teacherNoteHandler";
import toast from "react-hot-toast";
import { useCallback, useRef } from "react";

interface TeacherNoteProps {
    attendance: Attendance;
}

function TeacherNote(props: TeacherNoteProps) {
    const cooldown = useRef<number>(0);
    const currentNote = useRef<string>(props.attendance.teacherNote || "");
    const handleTeacherNoteChange = useCallback((teacherNote: string, attendanceID: string) => {
        currentNote.current = teacherNote;
        if (cooldown.current > 0) {
            cooldown.current = 75;
            return;
        } else {
            cooldown.current = 75;
            const interval = setInterval(async () => {
                cooldown.current--;
                if (cooldown.current <= 0) {
                    clearInterval(interval);
                    const data = await setTeacherNote(currentNote.current, attendanceID);
                    if (data === "success") {
                        toast.success("Notiz erfolgreich gespeichert");
                    } else {
                        toast.error("Fehler beim speichern der Notiz");
                    }
                }
            }, 1);
        }
    }, []);
    return (
        <td>
            <textarea defaultValue={props.attendance.teacherNote || ""} onChange={(e) => handleTeacherNoteChange(e.target.value, props.attendance.id)} placeholder="Lehrer Notiz" name="Note" className="border-gray-200 border-2 rounded-md"></textarea>
        </td>
    )
}

export default TeacherNote;