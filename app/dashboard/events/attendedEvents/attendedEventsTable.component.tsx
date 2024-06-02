"use client"

import moment from "moment";
import { GetSortOrderByCreatedAt } from "@/app/src/modules/sortUtilities";
import StudentNote from "./studentNote.component";
import StudyTimeSelect from "./studyTimeSelect.component";

function AttendedEventTable(attendances: any) {
    attendances.attendances.sort(GetSortOrderByCreatedAt("event"))
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Lehrer</th>
                            {attendances.studyTime ? <th>Studienzeit</th> : null}
                            <th>Schüler Notiz</th>
                            <th>Lehrer Notiz</th>
                            <th>Wann Teilgenommen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendances.attendances.map((attendance: any) => (
                            <tr key={attendance.attendance.id}>
                                <td>{attendance.event.name}</td>
                                <td>{attendance.eventUser.displayname}</td>
                                {attendances.studyTime ? attendance.event.studyTime? attendances.addable ?  <StudyTimeSelect attendance={attendance.attendance} />: <td>{attendance.attendance.type}</td> : <td>❌</td> : null}
                                {attendances.addable ? <StudentNote attendance={attendance.attendance} /> : <td>{attendance.attendance.studentNote}</td>}
                                <td>{attendance.attendance.teacherNote}</td>
                                <td>{moment(Date.parse(attendance.attendance.created_at)).format("DD.MM.YYYY HH:mm")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AttendedEventTable;