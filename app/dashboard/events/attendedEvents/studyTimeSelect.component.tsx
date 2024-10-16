"use client"

import { Attendances } from "@prisma/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import studyTimeSelectHandler from "./studyTimeSelectHandler";

interface StudyTimeSelectProps {
    attendance: Attendances;
    studyTimeTypes: string[];
}

function StudyTimeSelect(props: StudyTimeSelectProps) {
    let defaultValue = props.attendance.type || "default";
    const router = useRouter();
    async function saveType(type: string) {
        const data = await studyTimeSelectHandler(props.attendance.id, props.attendance.userID, type);
        if (data) {
            toast.success("Fach erfolgreich gespeichert");
            router.refresh();
        } else {
            toast.error("Fehler beim Speichern des Faches");
            router.refresh();
        }
    }
    return (
        <td>
            <select className="border-gray-200 border-2 rounded-md p-2.5 bg-white" defaultValue={defaultValue} onChange={(e) => saveType(e.target.value)}>
                <option disabled value="default">Fach wählen</option>
                {props.attendance.type ? <option value={props.attendance.type}>{props.attendance.type}</option> : null}
                {props.studyTimeTypes.map((type: string) => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
        </td>
    );
}

export default StudyTimeSelect;