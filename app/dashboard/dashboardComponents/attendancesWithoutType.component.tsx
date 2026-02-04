
import { AttendancePerUserPerEvent } from "@/app/src/interfaces/events";

function AttendancesWithoutType(props: { attendances: AttendancePerUserPerEvent[] }) {
    // Sort attendances by event type and user display name
    props.attendances.sort((a, b) => {
        const nameA = a.event.type.toLowerCase() + " " + a.eventUser.displayname.toLowerCase();
        const nameB = b.event.type.toLowerCase() + " " + b.eventUser.displayname.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Nicht zugeordnete Studienzeiten</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.attendances.length > 0 ? (props.attendances.map((data) => (
                            <tr key={data.attendance.id}>
                                <td>Studienzeit {data.event.type + " " + data.eventUser.displayname} </td>
                            </tr>
                        ))) : (<tr><td className="italic">Alle Studienzeiten zugeordnet!</td></tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AttendancesWithoutType;