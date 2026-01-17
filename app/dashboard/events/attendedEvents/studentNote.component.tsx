"use client";

import { Attendance } from "@prisma/client";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { createStudentNote } from "./actions";

function StudentNote(props: { attendance: Attendance }) {
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
                const data = await createStudentNote(debouncedNote, props.attendance.id);
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
    }, [debouncedNote, props.attendance.studentNote, props.attendance.id]);
    return (
        <textarea
            defaultValue={props.attendance.studentNote || ""}
            onChange={(e) => { setNote(e.target.value); changed.current = true }}
            placeholder="Notiz..."
            className="border-gray-300 border rounded-md p-2 text-sm w-full min-w-[150px] focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
            rows={1}
            style={{ minHeight: '34px', resize: 'vertical' }}
        ></textarea>
    )
}

export default StudentNote;
