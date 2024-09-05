"use client"

import moment from "moment";
import StudentNote from "./studentNote.component";
import StudyTimeSelect from "./studyTimeSelect.component";
import { AttendancePerUserPerEvent } from "@/app/src/interfaces/events";

interface AttendedEventTableProps {
    attendances: AttendancePerUserPerEvent[];
    studyTime: boolean;
    addable: boolean;
    studyTimeTypes: Record<string, string[]>;
}

function AttendedEventTable(props: AttendedEventTableProps) {
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
                        {props.attendances.map((attendances: AttendancePerUserPerEvent) => (
                            <tr key={attendances.attendance.id}>
                                <td>{attendances.event.name.replace(attendances.eventUser.displayname, "")}</td>
                                <td>{attendances.eventUser.displayname}</td>
                                {props.studyTime ? attendances.event.studyTime ? props.addable ? <StudyTimeSelect attendance={attendances.attendance} studyTimeTypes={props.studyTimeTypes[attendances.attendance.id]} /> : attendances.attendance.type ? <td>{attendances.attendance.type.replace("parallel:", "Vertretung:").replace("note:", "Notiz:")}</td> : <span className={"italic"}>Keine Studienzeit ausgewählt</span> : <td>❌</td> : null}
                                {props.addable ? <StudentNote attendance={attendances.attendance} /> : <td>{attendances.attendance.studentNote}</td>}
                                <td>{attendances.attendance.teacherNote}</td>
                                <td>{moment(attendances.attendance.created_at).format("DD.MM.YYYY HH:mm")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {props.attendances.length === 0 ? <p className="text-center italic m-2">An keiner Veranstaltungen teilgenommen</p> : null}
            </div>
        </div>
    )
}

export default AttendedEventTable;