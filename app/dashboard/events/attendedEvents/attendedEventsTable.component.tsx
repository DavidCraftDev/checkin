"use client"

import StudentNote from "./studentNote.component";
import StudyTimeSelect from "./studyTimeSelect.component";
import { AttendancePerUserPerEvent } from "@/app/src/interfaces/events";
import dayjs from "dayjs";

interface AttendedEventTableProps {
    attendances: AttendancePerUserPerEvent[];
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
                            <th>Stammfach</th>
                            <th>Lehrer</th>
                            <th>Fach</th>
                            <th>Schüler Notiz</th>
                            <th>Lehrer Notiz</th>
                            <th>Wann Teilgenommen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.attendances.map((attendances: AttendancePerUserPerEvent) => (
                            <tr key={attendances.attendance.id}>
                                <td>{attendances.event.type}</td>
                                <td>{attendances.eventUser.displayname}</td>
                                {props.addable ? <StudyTimeSelect attendance={attendances.attendance} studyTimeTypes={props.studyTimeTypes[attendances.attendance.id]} /> : attendances.attendance.type ? <td>{attendances.attendance.type}</td> : <span className={"italic"}>Keine Studienzeit ausgewählt</span>}
                                {props.addable ? <StudentNote attendance={attendances.attendance} /> : <td>{attendances.attendance.studentNote}</td>}
                                <td>{attendances.attendance.teacherNote}</td>
                                <td>{dayjs(attendances.attendance.created_at).format("DD.MM. HH:mm")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {props.attendances.length === 0 ? <p className="text-center italic m-2">An keiner Studienzeit teilgenommen</p> : null}
            </div>
        </div>
    )
}

export default AttendedEventTable;