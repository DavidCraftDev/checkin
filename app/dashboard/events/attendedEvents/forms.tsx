"use client";

import { useRouter } from 'next/navigation';
import { createStudyTimeNote, saveSelectedStudyTimeType } from "./actions";
import { SubmitButton } from "@/app/src/ui/submitButton";
import { Attendances } from '@prisma/client';
import toast from 'react-hot-toast';

export function CreateStudyTimeNote(props: { userID: string, cw: number }) {
    const router = useRouter();
    async function submitCreateStudyTimeNote(): Promise<void> {
        const data = await createStudyTimeNote(props.userID, props.cw);
        if (data.success) toast.success("Notiz erstellt");
        else if (data.warning) toast.error(data.warning);
        else if (data.error) toast.error(data.error);
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
    let defaultValue = props.attendance.type || "default";
    const router = useRouter();
    async function submitStudyTimeSelect(type: string): Promise<void> {
        const data = await saveSelectedStudyTimeType(props.attendance.id, props.attendance.userID, type, type);
        if (data.success) toast.success("Studienzeit gespeichert");
        else if (data.error) toast.error(data.error);
        else toast.error("Ein unbekannter Fehler ist aufgetreten");
        router.refresh();
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