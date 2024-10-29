import { AttendancePerUserPerEvent } from "@/app/src/interfaces/events";

function AttendancesWithoutType(props: { attendances: AttendancePerUserPerEvent[] }) {
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