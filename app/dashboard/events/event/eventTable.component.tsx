"use client"

import moment from "moment";
import TeacherNote from "./teacherNote.component";
import { AttendancePerEventPerUser } from "@/app/src/interfaces/events";

interface EventTableProps {
    studyTime: boolean,
    attendances: AttendancePerEventPerUser[],
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
                            {props.studyTime ? <th>Fach</th> : null}
                            <th>Schüler Notiz</th>
                            <th>Lehrer Notiz</th>
                            <th>Wann hinzugefügt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.attendances.map((attendance: AttendancePerEventPerUser) => (
                            <tr key={attendance.attendance.id}>
                                <td>{attendance.user.displayname}</td>
                                {props.studyTime ? attendance.attendance.type ? <td>{attendance.attendance.type.replace("parallel:", "Vertretung:").replace("note:", "Notiz:")}</td> : <td>❌</td> : null}
                                <td>{attendance.attendance.studentNote}</td>
                                {props.addable ? <TeacherNote attendance={attendance.attendance} /> : <td>{attendance.attendance.teacherNote}</td>}
                                <td>{moment(attendance.attendance.created_at).format("DD.MM.YYYY HH:mm")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default EventTable;
