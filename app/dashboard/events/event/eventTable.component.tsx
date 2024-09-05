"use client"

import moment from "moment";
import TeacherNote from "./teacherNote.component";
import { AttendancePerEventPerUser } from "@/app/src/interfaces/events";
import { deleteEventHandler } from "./deleteEventHandler";
import { useRouter } from "next/navigation";

interface EventTableProps {
    studyTime: boolean,
    attendances: AttendancePerEventPerUser[],
    eventID: string,
    addable: boolean
}

function EventTable(props: EventTableProps) {
    const router = useRouter();
    async function handleDelete() {
        const data = await deleteEventHandler(props.eventID);
        if (data) router.push("/dashboard/events/createdEvents");
        else router.refresh();
    }
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
                {props.attendances.length === 0 ? <p className="text-center italic m-2">Keine Teilnehmer</p> : null}
                {props.attendances.length === 0 ? <p className="text-center"><button onClick={handleDelete} className="btn bg-red-700 hover:bg-red-900 m-2 mt-0 text-center">{props.studyTime ? "Studienzeit" : "Veranstaltung"} löschen</button></p> : null}
            </div>
        </div>
    )
}

export default EventTable;
