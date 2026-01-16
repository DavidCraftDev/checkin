"use client";

import { useRouter } from 'next/navigation';
import { createStudyTimeNote, saveSelectedStudyTimeType, saveSelfReflection } from "./actions";
import { SubmitButton } from "@/components/submitButton";
import { Attendances } from '@prisma/client';
import { toast } from 'sonner';

export function CreateStudyTimeNote(props: { userID: string, cw: number, year: number }) {
    const router = useRouter();
    async function submitCreateStudyTimeNote(): Promise<void> {
        const data = await createStudyTimeNote(props.userId, props.cw, props.year);
        if (data && data.success) toast.success("Notiz erstellt");
        else if (data && data.warning) toast.error(data.warning);
        else if (data && data.error) toast.error(data.error);
        else toast.error("Ein unbekannter Fehler ist aufgetreten");
        router.refresh();
    }
    return (
        <form action={submitCreateStudyTimeNote} className="w-fit">
            <SubmitButton text="Notiz erstellen" />
        </form>
    );
}

export function StudyTimeSelect(props: { attendance: Attendances, studyTimeTypes: string[] }) {
    const defaultValue = props.attendance.type || "default";
    const router = useRouter();
    async function submitStudyTimeSelect(type: string): Promise<void> {
        const data = await saveSelectedStudyTimeType(props.attendance, props.attendance.userId, type);
        if (data && data.success) toast.success("Studienzeit gespeichert");
        else if (data && data.error) toast.error(data.error);
        else toast.error("Ein unbekannter Fehler ist aufgetreten");
        router.refresh();
    }
    if (props.attendance.type == "Unterricht") {
        if (props.attendance.attended) return <td>Anwesend</td>;
        else return <td>Nicht anwesend</td>;
    }
    return (
        <td>
            <select className="border-gray-200 border-2 rounded-md p-2.5 bg-white" defaultValue={defaultValue} onChange={(event) => submitStudyTimeSelect(event.target.value)}>
                <option disabled value="default">Fach wählen</option>
                {props.attendance.type ? <option value={props.attendance.type}>{props.attendance.type}</option> : null}
                {props.studyTimeTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
        </td>
    );
}

// Let the User select a own emoji for self-reflection
export function SelfReflectionEmojiSelect(props: { attendance: Attendances }) {
    const router = useRouter();
    const emojiOptions = ["🤩", "😀", "😐", "😔", "😡", "🤔", "😴"];
    const defaultValue = props.attendance.selfReflection || "";
    async function handleEmojiSelect(emoji: string) {
        const data = await saveSelfReflection(props.attendance, emoji);
        if (data && data.success) toast.success("Emoji gespeichert");
        else if (data && data.error) toast.error(data.error);
        else toast.error("Ein unbekannter Fehler ist aufgetreten");
        router.refresh();
    }
    return (
        <select
            className="border-gray-200 border-2 rounded-md p-2.5 bg-white"
            defaultValue={defaultValue}
            onChange={e => handleEmojiSelect(e.target.value)}
        >
            <option disabled value="">Emoji wählen</option>
            {emojiOptions.map(emoji => (
                <option key={emoji} value={emoji}>{emoji}</option>
            ))}
        </select>
    );
}