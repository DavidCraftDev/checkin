"use client"

import { Attendances } from "@prisma/client";
import setStudentNote from "./studentNoteHandler";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";

interface StudentNoteProps {
    attendance: Attendances;
}

function StudentNote(props: StudentNoteProps) {
    const [note, setNote] = useState<string>(props.attendance.studentNote || "");
    const [debouncedNote, setDebouncedNote] = useState<string>(note);
    const changed = useRef(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
                const data = await setStudentNote(debouncedNote, props.attendance.id);
                if (data === "success") {
                    toast.success("Notiz erfolgreich gespeichert");
                } else {
                    toast.error("Fehler beim Speichern der Notiz");
                }
            }
        }
        saveNote();
    }, [debouncedNote, props.attendance.studentNote, props.attendance.id]);

    useEffect(() => {
        if (textareaRef.current && !props.attendance.studentNote && props.attendance.eventID === "NOTE") textareaRef.current.focus();
    }, [props.attendance.studentNote, props.attendance.eventID]);
    return (
        <td>
            <textarea ref={textareaRef} value={note} onChange={(e) => { setNote(e.target.value); changed.current = true }} placeholder="Schüler Noitz" name="StudentNote" className="border-gray-200 border-2 rounded-md"></textarea>
        </td>
    )
}

export default StudentNote;