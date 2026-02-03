"use server";

import TeacherNote from "./teacherNote.component";
import { AttendancePerEventPerUser } from "@/app/src/interfaces/events";
import { StudentAttendButton } from "./forms";
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
                            <th>Anwesend?</th>
                            <th>Schüler Notiz</th>
                            <th>Lehrer Notiz</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.attendances.map((attendance: AttendancePerEventPerUser) => (
                            <tr key={attendance.attendance.id}>
                                <td>{attendance.user.displayname}</td>
                                <td>{attendance.attendance.attended ? "✅" : "❌"}<StudentAttendButton attendanceID={attendance.attendance.id} attended={attendance.attendance.attended} /></td>
                                <td>{attendance.attendance.studentNote}</td>
                                {props.addable ? <TeacherNote attendance={attendance.attendance} /> : <td>{attendance.attendance.teacherNote}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {props.attendances.length === 0 ? <p className="text-center italic m-2">Keine Schüler gefunden</p> : null}
            </div>
        </div>
    )
}

export default EventTable;