"use client";

import { Attendance } from "@prisma/client";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { setTeacherNote } from "./actions";

function TeacherNote(props: { attendance: Attendance }) {
    const [note, setNote] = useState<string>(props.attendance.teacherNote || "");
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
            if (debouncedNote !== props.attendance.teacherNote) {
                const data = await setTeacherNote(debouncedNote, props.attendance.id);
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
    }, [debouncedNote, props.attendance.teacherNote, props.attendance.id]);
    return (
        <textarea
            defaultValue={props.attendance.teacherNote || ""}
            onChange={(e) => { setNote(e.target.value); changed.current = true }}
            placeholder="Notiz..."
            name="Note"
            className="border-gray-300 border rounded-md p-2 text-sm w-full min-w-[150px] focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
            rows={1}
            style={{ minHeight: '38px', resize: 'vertical' }}
        ></textarea>
    )
}

export default TeacherNote;
