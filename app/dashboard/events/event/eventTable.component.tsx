"use client"

import moment from "moment";
import TeacherNote from "./teacherNote.component";


function EventTable(props: any) {
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
                        {props.attendances.map((attendance: any) => (
                            <tr key={attendance.attendance.id}>
                                <td>{attendance.user.displayname}</td>
                                {props.studyTime ? attendance.attendance.type ? <td>{attendance.attendance.type.replace("parallel:", "Vertretung:").replace("note:", "Notiz:")}</td> : <td>❌</td> : null}
                                <td>{attendance.attendance.studentNote}</td>
                                {props.addable ? <TeacherNote attendance={attendance.attendance} /> : <td>{attendance.attendance.teacherNote}</td>}
                                <td>{moment(Date.parse(attendance.attendance.created_at)).format("DD.MM.YYYY HH:mm")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default EventTable;
