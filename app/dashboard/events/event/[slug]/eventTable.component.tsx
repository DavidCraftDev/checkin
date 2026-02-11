
import TeacherNote from "./teacherNote.component";
import { AttendancePerEventPerUser } from "@/app/src/interfaces/events";
import dayjs from "dayjs";
import { DeleteEventButton, RemoveUserButton, TrafficLightSelect } from "./forms";
import { User } from "@/app/src/modules/db";

interface EventTableProps {
    attendances: AttendancePerEventPerUser[],
    user: User,
    eventID: string,
    addable: boolean
}

function EventTable(props: EventTableProps) {
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Fach</th>
                            <th>Schüler Notiz</th>
                            <th>Lehrer Notiz</th>
                            <th>Ampel</th>
                            <th>Selbstreflexion</th>
                            <th>Zeitpunkt</th>
                            {props.addable ? <th>Schüler entfernen</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {props.attendances.map((attendance: AttendancePerEventPerUser) => (
                            <tr key={attendance.attendance.id}>
                                <td>{attendance.user.displayname}</td>
                                {attendance.attendance.type ? <td>{attendance.attendance.type}</td> : <td className="italic">Kein Fach ausgewählt</td>}
                                <td>{attendance.attendance.studentNote}</td>
                                {props.addable ? <TeacherNote attendance={attendance.attendance} /> : <td>{attendance.attendance.teacherNote}</td>}
                                <td><TrafficLightSelect attendance={attendance.attendance} /></td>
                                <td>{attendance.attendance.selfReflection || "❓"}</td>
                                <td>{dayjs(attendance.attendance.created_at).format("DD.MM. HH:mm")}</td>
                                {props.addable ? <RemoveUserButton user={props.user} attendance={attendance.attendance} removeUser={attendance.user} /> : null}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {props.attendances.length === 0 ? <p className="text-center italic m-2">Keine Schüler anwesend</p> : null}
                {props.attendances.length === 0 ? <DeleteEventButton eventID={props.eventID} /> : null}
            </div>
        </div>
    )
}

export default EventTable;