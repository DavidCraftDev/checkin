"use server";

import StudentNote from "./studentNote.component";
import { AttendancePerUserPerEvent } from "@/app/src/interfaces/events";
import dayjs from "dayjs";
import { SelfReflectionEmojiSelect, StudyTimeSelect } from "./forms";
import TeacherNote from "../event/teacherNote.component";
import TrafficLight from "./trafficLight";

interface AttendedEventTableProps {
    attendances: AttendancePerUserPerEvent[];
    isEditable: boolean;
    studyTimeTypes: Record<string, string[]>;
    isTeacher: boolean;
}

function AttendedEventTable(props: AttendedEventTableProps) {
    function getTeacherDisplayName(name: string): string {
        const parts = name.split(" ");
        if (parts.length === 1) return name;
        // Return first letter of first name and full last name
        return parts[0][0] + "." + parts[1]
    }
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
                            <th>Selbstreflexion</th>
                            <th>Ampel</th>
                            <th>Zeitpunkt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.attendances.map((attendances: AttendancePerUserPerEvent) => (
                            <tr key={attendances.attendance.id}>
                                <td>{attendances.event.type}</td>
                                <td>{getTeacherDisplayName(attendances.eventUser.displayname)}</td>
                                {props.isEditable ? <StudyTimeSelect attendance={attendances.attendance} studyTimeTypes={props.studyTimeTypes[attendances.attendance.id]} /> : attendances.attendance.type ? <td>{attendances.attendance.type}</td> : <span className={"italic"}>Keine Studienzeit ausgewählt</span>}
                                {props.isEditable ? <StudentNote attendance={attendances.attendance} /> : <td>{attendances.attendance.studentNote}</td>}
                                {props.isTeacher ? <TeacherNote attendance={attendances.attendance} /> : <td>{attendances.attendance.teacherNote}</td>}
                                {props.isEditable ? <td><SelfReflectionEmojiSelect attendance={attendances.attendance} /></td> : <td>{attendances.attendance.selfReflection || "❓"}</td>}
                                <td><TrafficLight status={attendances.attendance.feedback} /></td>
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