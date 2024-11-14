"use client";

import { useSearchParams } from 'next/navigation';
import { createStudyTimeNote, saveSelectedStudyTimeType } from "./actions";
import { SubmitButton } from "@/app/src/ui/submitButton";
import { Attendances } from '@prisma/client';

export function CreateStudyTimeNote(props: { userID: string, cw: number }) {
    const searchParams = useSearchParams();
    return (
        <form action={() => { createStudyTimeNote(props.userID, props.cw, searchParams.toString()) }} className="w-fit">
            <SubmitButton text="Notiz erstellen" />
        </form>
    );
}

export function StudyTimeSelect(props: { attendance: Attendances, studyTimeTypes: string[] }) {
    let defaultValue = props.attendance.type || "default";
    const searchParams = useSearchParams();
    return (
        <td>
            <select className="border-gray-200 border-2 rounded-md p-2.5 bg-white" value={defaultValue} onChange={(event) => saveSelectedStudyTimeType(props.attendance.id, props.attendance.userID, event.target.value, searchParams.toString())}>
                <option disabled value="default">Fach wählen</option>
                {props.attendance.type ? <option value={props.attendance.type}>{props.attendance.type}</option> : null}
                {props.studyTimeTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
        </td>
    );
}