"use client";

import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { setStudentNote } from "./actions";
import { Attendances } from "@/app/src/modules/db";

function StudentNote(props: { attendance: Attendances }) {
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
                const data = await setStudentNote(debouncedNote, props.attendance);
                if (data && data.success) {
                    toast.success("Notiz erfolgreich gespeichert");
                } else if (data && data.error) {
                    toast.error(data.error);
                } else {
                    toast.error("Ein unbekannter Fehler ist aufgetreten");
                }
            }
        }
        saveNote();
    }, [debouncedNote, props.attendance]);

    useEffect(() => {
        if (textareaRef.current && !props.attendance.studentNote && props.attendance.eventID === "NOTE") textareaRef.current.focus();
    }, [props.attendance.studentNote, props.attendance.eventID]);
    return (
        <td>
            <textarea ref={textareaRef} value={note} onChange={(e) => { setNote(e.target.value); changed.current = true }} placeholder="Schüler Notiz" name="StudentNote" className="border-gray-200 border-2 rounded-md"></textarea>
        </td>
    )
}

export default StudentNote;
