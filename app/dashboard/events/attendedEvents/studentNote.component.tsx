// 👨‍🎓 STUDENT NOTE COMPONENT! Write your thoughts! 📝
"use client";

// 🎪 Import party! React hooks and utilities! 🎭
import { Attendances } from "@prisma/client"; // 📊 Attendance type!
import { toast } from "sonner"; // 🍞 Toast notifications! Pop-up messages! 
import { useEffect, useRef, useState } from "react"; // ⚛️ React hooks galore!
import { setStudentNote } from "./actions"; // 💾 Save note action!

// ✍️ Component for student notes! Express yourself! 🎨
function StudentNote(props: { attendance: Attendances }) {
    const [note, setNote] = useState<string>(props.attendance.studentNote || ""); // 📝 Current note state!
    const [debouncedNote, setDebouncedNote] = useState<string>(note); // ⏱️ Debounced note for saving!
    const changed = useRef(false); // 🚩 Track if note was changed!
    const textareaRef = useRef<HTMLTextAreaElement>(null); // 📋 Reference to textarea element!

    // ⏱️ Debounce effect! Wait 500ms before setting debounced note! Don't save on every keystroke! 
    useEffect(() => {
        if (!changed.current) return; // 🚫 Not changed? Skip it!
        const timeout = setTimeout(() => {
            setDebouncedNote(note); // 💾 Set debounced note after delay!
        }, 500); // ⏰ 500ms delay! Half a second to think!

        // 🧹 Cleanup function! Clear timeout on unmount!
        return () => {
            clearTimeout(timeout);
        };
    }, [note]);

    // 💾 Save effect! Save the note when debounced value changes! 
    useEffect(() => {
        if (!changed.current) return; // 🚫 Not changed? Don't save!
        async function saveNote() {
            // 🔍 Only save if note actually changed!
            if (debouncedNote !== props.attendance.studentNote) {
                const data = await setStudentNote(debouncedNote, props.attendance); // 💾 Save to database!
                if (data && data.success) {
                    toast.success("Notiz erfolgreich gespeichert"); // ✅ Success toast! Green and beautiful!
                } else if (data && data.error) {
                    toast.error(data.error); // ❌ Error toast with message!
                } else {
                    toast.error("Ein unbekannter Fehler ist aufgetreten"); // 💥 Unknown error toast!
                }
            }
        }
        saveNote(); // 💾 Execute the save!
    }, [debouncedNote, props.attendance]);

    // 🎯 Auto-focus effect! Focus textarea for NOTE events without existing note!
    useEffect(() => {
        if (textareaRef.current && !props.attendance.studentNote && props.attendance.eventID === "NOTE") textareaRef.current.focus();
    }, [props.attendance.studentNote, props.attendance.eventID]);
    return (
        <td>
            {/* ✍️ The textarea! Write your heart out! 💭 */}
            <textarea ref={textareaRef} value={note} onChange={(e) => { setNote(e.target.value); changed.current = true }} placeholder="Schüler Notiz" name="StudentNote" className="border-gray-200 border-2 rounded-md"></textarea>
        </td>
    )
}

export default StudentNote; // 🎁 Export the note-taking wizard! 🧙
