// 👨‍🏫 TEACHER NOTE COMPONENT! Leave feedback for students! 📝
"use client";

// 🎪 Import extravaganza! React and utilities! 🎭
import { Attendances } from "@prisma/client"; // 📊 Attendance type!
import { toast } from "sonner"; // 🍞 Toast notifications! Yummy!
import { useEffect, useRef, useState } from "react"; // ⚛️ React hooks!
import { setTeacherNote } from "./actions"; // 💾 Save teacher note action!

// 👨‍🏫 Component for teacher notes! Give feedback like a pro! 📚
function TeacherNote(props: { attendance: Attendances }) {
    const [note, setNote] = useState<string>(props.attendance.teacherNote || ""); // 📝 Current note state!
    const [debouncedNote, setDebouncedNote] = useState<string>(note); // ⏱️ Debounced note!
    const changed = useRef(false); // 🚩 Change tracker!

    // ⏱️ Debounce effect! Wait 500ms before updating debounced note! Patience is a virtue! 
    useEffect(() => {
        if (!changed.current) return; // 🚫 No changes? Skip!
        const timeout = setTimeout(() => {
            setDebouncedNote(note); // 💾 Update debounced note!
        }, 500); // ⏰ Half a second delay!

        // 🧹 Cleanup function! Always tidy up! 
        return () => {
            clearTimeout(timeout); // ⏰ Clear that timeout!
        };
    }, [note]);

    // 💾 Save effect! Auto-save when debounced note changes! Magic! ✨
    useEffect(() => {
        if (!changed.current) return; // 🚫 Not changed? Don't bother saving!
        async function saveNote() {
            // 🔍 Only save if note actually changed!
            if (debouncedNote !== props.attendance.teacherNote) {
                const data = await setTeacherNote(debouncedNote, props.attendance.id); // 💾 Save it!
                if (data && data.success) {
                    toast.success("Notiz erfolgreich gespeichert"); // ✅ Success! Green toast!
                } else if (data && data.error) {
                    toast.error(data.error); // ❌ Error with message!
                } else {
                    toast.error("Ein unbekannter Fehler ist aufgetreten"); // 💥 Mystery error!
                }
            }
        }
        saveNote(); // 💾 Execute the save function!
    }, [debouncedNote, props.attendance.teacherNote, props.attendance.id]);
    return (
        <td>
            {/* ✍️ The textarea for teacher wisdom! Share your thoughts! 💭 */}
            <textarea defaultValue={props.attendance.teacherNote || ""} onChange={(e) => { setNote(e.target.value); changed.current = true }} placeholder="Lehrer Notiz" name="Note" className="border-gray-200 border-2 rounded-md"></textarea>
        </td>
    )
}

export default TeacherNote; // 🎁 Export the wisdom dispenser! 🧙‍♂️