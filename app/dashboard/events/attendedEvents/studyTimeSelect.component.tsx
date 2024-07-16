"use client"

import { saveStudyTimeType } from "@/app/src/modules/studytimeUtilities";
import { Attendance } from "@prisma/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface StudyTimeSelectProps {
    attendance: Attendance;
    studyTimeTypes: string[];
}

function StudyTimeSelect(props: StudyTimeSelectProps) {
    let defaultValue = props.attendance.type || "default";
    const router = useRouter();
    async function saveType(type: string) {
        try {
            const data = await saveStudyTimeType(props.attendance.id, type);
            if (data === "success") {
                toast.success("Studienzeit erfolgreich gespeichert");
            } else {
                toast.error("Fehler beim Speichern der Studienzeit");
            }
        } catch (error) {
            toast.error("Fehler beim Speichern der Studienzeit");
        } finally {
            router.refresh();
        }
    }
    return (
        <td>
            <select className="border-gray-200 border-2 rounded-md p-2.5 bg-white" defaultValue={defaultValue} onChange={(e) => saveType(e.target.value)}>
                <option disabled value="default">Studienzeit wählen</option>
                {props.attendance.type ? <option value={props.attendance.type}>{props.attendance.type.replace("parallel:", "Vertretung:").replace("note:", "Notiz:")}</option> : null}
                {props.studyTimeTypes.map((type: any) => (
                    <option key={type} value={type}>{type.replace("parallel:", "Vertretung:").replace("note:", "Notiz:")}</option>
                ))}
            </select>
        </td>
    );
}

export default StudyTimeSelect;