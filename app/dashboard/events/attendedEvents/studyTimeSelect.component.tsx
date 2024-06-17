"use client"

import { saveStudyTimeType } from "@/app/src/modules/studytimeUtilities";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function StudyTimeSelect(props: any) {
    let defaultValue = "default";
    if (props.attendance.type) defaultValue = props.attendance.type;
    const router = useRouter();
    async function saveType(type: string) {
        let data = await saveStudyTimeType(props.attendance.id, type);
        if (data === "success") toast.success("Studienzeit erfolgreich gespeichert")
        else toast.error("Fehler beim speichern der Studienzeit")
        router.refresh()
    }
    return (
        <td>
            <select className="border-gray-200 border-2 rounded-md p-2.5 bg-white" defaultValue={defaultValue} onChange={(e) => saveType(e.target.value)}>
                <option disabled value="default">Studienzeit wählen</option>
                {props.attendance.type ? <option value={props.attendance.type}>{props.attendance.type.replace("parallel:", "Vertretung:")}</option> : null}
                {props.studyTimeTypes.map((type: any) => (
                    <option key={type} value={type}>{type.replace("parallel:", "Vertretung:")}</option>
                ))}
            </select>
        </td>
    )
}

export default StudyTimeSelect;