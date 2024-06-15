import { getNeededStudyTimesSelect } from "@/app/src/modules/studytimeUtilities";

async function StudyTimeSelect(props: any) {
    let defaultValue = "default";
    if (props.attendance.type) defaultValue = props.attendance.type;
    return (
        <td>
            <select className="border-gray-200 border-2 rounded-md p-2.5 bg-white" defaultValue={defaultValue} onChange={(e) => console.log(e)}>
                <option disabled value="default">Studienzeit wählen</option>
                {props.attendance.type ? <option value={props.attendance.type}>{props.attendance.type}</option> : null}
                {props.needed.map((type: any) => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
        </td>
    )
}

export default StudyTimeSelect;