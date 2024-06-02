import { getNeededStudyTimes } from "@/app/src/modules/studytimeUtilities";

async function StudyTimeSelect(props: any) {
    let defaultValue = "default";
    if(props.attendance.type) defaultValue = props.attendance.type;
    console.log(props)
    const needed: Array<String> = await getNeededStudyTimes(props.attendance.userID, props.attendance.eventID)
return (
    <td>
        <select className="border-gray-200 border-2 rounded-md p-2.5 bg-white" defaultValue={defaultValue}>
            <option disabled value="default">Studienzeit wählen</option>
            {props.attendance.type ? <option value={props.attendance.type}>{props.attendance.type}</option> : null}
            {needed.map((type: any) => (
                <option key={type} value={type}>{type}</option>
            ))}
        </select>
    </td>
)
}

export default StudyTimeSelect;