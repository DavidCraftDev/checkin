"use client";

import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { setTeacherNote } from "./actions";
import { Attendances } from "@/app/src/modules/db";

function TeacherNote(props: { attendance: Attendances }) {
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
                    toast.success("Deine Worte wurden in die Akten aufgenommen — ob sie je gelesen werden, ist ungewiss");
                } else if (data && data.error) {
                    toast.error(data.error);
                } else {
                    toast.error("Ein namenloser Fehler hat sich aus den Tiefen des Systems erhoben");
                }
            }
        }
        saveNote();
    }, [debouncedNote, props.attendance.teacherNote, props.attendance.id]);
    return (
        <td>
            <textarea defaultValue={props.attendance.teacherNote || ""} onChange={(e) => { setNote(e.target.value); changed.current = true }} placeholder="Lehrer Notiz" name="Note" className="border-gray-200 border-2 rounded-md"></textarea>
        </td>
    )
}

export default TeacherNote;