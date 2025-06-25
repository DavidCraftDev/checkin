"use client";

import { useRouter } from 'next/navigation';
import { createStudyTimeNote, saveSelectedStudyTimeType, saveSelfReflection } from "./actions";
import { SubmitButton } from "@/app/src/ui/submitButton";
import { Attendances } from '@prisma/client';
import toast from 'react-hot-toast';

export function CreateStudyTimeNote(props: { userID: string, cw: number, year: number }) {
    const router = useRouter();
    async function submitCreateStudyTimeNote(): Promise<void> {
        const data = await createStudyTimeNote(props.userID, props.cw, props.year);
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
        const data = await saveSelectedStudyTimeType(props.attendance, props.attendance.userID, type);
        if (data && data.success) toast.success("Studienzeit gespeichert");
        else if (data && data.error) toast.error(data.error);
        else toast.error("Ein unbekannter Fehler ist aufgetreten");
        router.refresh();
    }
    if(props.attendance.type == "Unterricht") {
        if(props.attendance.attended) return <td>Anwesend</td>
        else return <td>Nicht anwesend</td>
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

export function SelfReflectionSelect(props: { attendance: Attendances, type: "goodWorkatmosphere" | "productiveWork" }) {
    const router = useRouter();
    let isChecked = true;
    if(props.type === "goodWorkatmosphere") {
        isChecked = props.attendance.goodAtmosphere;
    } else if(props.type === "productiveWork") {
        isChecked = props.attendance.productiveWork;
    }
    
    async function toggleSelfReflection(): Promise<void> {
        const data = await saveSelfReflection(props.attendance, props.type);
        if (data && data.success) {
            toast.success("Selbstreflexion aktualisiert");
        } else if (data && data.error) {
            toast.error(data.error);
        } else {
            toast.error("Ein unbekannter Fehler ist aufgetreten");
        }
        router.refresh();
    }

    return (
        <td>
            <button type="button" onClick={toggleSelfReflection} className="text-2xl border-2 border-gray-400">
                {isChecked ? "✅" : "❌"}
            </button>
        </td>
    );
}