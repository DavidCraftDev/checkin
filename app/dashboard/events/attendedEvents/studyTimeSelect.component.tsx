"use client"

import { Attendance } from "@prisma/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import studyTimeSelectHandler from "./studyTimeSelectHandler";

interface StudyTimeSelectProps {
    attendance: Attendance;
    studyTimeTypes: string[];
}

function StudyTimeSelect(props: StudyTimeSelectProps) {
    let defaultValue = props.attendance.type || "default";
    const router = useRouter();
    async function saveType(type: string) {
        const data = await studyTimeSelectHandler(props.attendance.id, type);
        if (data) {
            toast.success("Studienzeit erfolgreich gespeichert");
            router.refresh();
        } else {
            toast.error("Fehler beim Speichern der Studienzeit");
            router.refresh();
        }
    }
    return (
        <td>
            <select className="border-gray-200 border-2 rounded-md p-2.5 bg-white" defaultValue={defaultValue} onChange={(e) => saveType(e.target.value)}>
                <option disabled value="default">Studienzeit wählen</option>
                {props.attendance.type ? <option value={props.attendance.type}>{props.attendance.type.replace("parallel:", "Vertretung:").replace("note:", "Notiz:")}</option> : null}
                {props.studyTimeTypes.map((type: string) => (
                    <option key={type} value={type}>{type.replace("parallel:", "Vertretung:").replace("note:", "Notiz:").replace("Notiz:delete", "Notiz löschen")}</option>
                ))}
            </select>
        </td>
    );
}

export default StudyTimeSelect;