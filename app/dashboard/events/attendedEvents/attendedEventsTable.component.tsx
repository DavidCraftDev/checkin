"use client"

import moment from "moment";
import { GetSortOrderByCreatedAt } from "@/app/src/modules/sortUtilities";
import StudentNote from "./studentNote.component";
import StudyTimeSelect from "./studyTimeSelect.component";

function AttendedEventTable(props: any) {
    props.attendances.sort(GetSortOrderByCreatedAt("event"))
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Lehrer</th>
                            {props.studyTime ? <th>Studienzeit</th> : null}
                            <th>Schüler Notiz</th>
                            <th>Lehrer Notiz</th>
                            <th>Wann Teilgenommen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.attendances.map((attendance: any) => (
                            <tr key={attendance.attendance.id}>
                                <td>{attendance.event.name}</td>
                                <td>{attendance.eventUser.displayname}</td>
                                {props.studyTime ? attendance.event.studyTime ? props.addable ? <StudyTimeSelect attendance={attendance.attendance} studyTimeTypes={props.studyTimeTypes[attendance.attendance.id]} /> : attendance.attendance.type ? <td>{attendance.attendance.type.replace("parallel:", "Vertretung:").replace("note:", "Notiz:")}</td> : <span className={"italic"}>Keine Studienzeit ausgewählt</span> : <td>❌</td> : null}
                                {props.addable ? <StudentNote attendance={attendance.attendance} /> : <td>{attendance.attendance.studentNote}</td>}
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