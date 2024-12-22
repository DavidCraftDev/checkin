"use client";

import { Attendances } from "@prisma/client";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { setTeacherNote } from "./actions";

interface TeacherNoteProps {
    attendance: Attendances;
}

function TeacherNote(props: TeacherNoteProps) {
    const [note, setNote] = useState<string>(props.attendance.studentNote || "");
    const [debouncedNote, setDebouncedNote] = useState<string>(note);
    const changed = useRef(false);

    useEffect(() => {
        if (!changed.current) return;
        const timeout = setTimeout(() => {
            setDebouncedNote(note);
        }, 500);

        return () => {
            clearTimeout(timeout);
        };
    }, [note]);

    useEffect(() => {
        if (!changed.current) return;
        async function saveNote() {
            if (debouncedNote !== props.attendance.studentNote) {
                const data = await setTeacherNote(debouncedNote, props.attendance.id);
                if (data.success) {
                    toast.success("Notiz erfolgreich gespeichert");
                } else if (data.error) {
                    toast.error(data.error);
                } else {
                    toast.error("Ein unbekannter Fehler ist aufgetreten");
                }
            }
        }
        saveNote();
    }, [debouncedNote, props.attendance.studentNote, props.attendance.id]);
    return (
        <td>
            <textarea defaultValue={props.attendance.teacherNote || ""} onChange={(e) => { setNote(e.target.value); changed.current = true }} placeholder="Lehrer Notiz" name="Note" className="border-gray-200 border-2 rounded-md"></textarea>
        </td>
    )
}

export default TeacherNote;