"use client"

import moment from "moment";
import setStudentNote from "./studentNoteHandler";
import toast from "react-hot-toast";
import { GetSortOrderByCreatedAt } from "@/app/src/modules/sortUtilities";


function AttendedEventTable(attendances: any) {
    async function handleStudentNoteChange(event: any, attendanceID: any) {
        const data = await setStudentNote(event, attendanceID)
        if(data === "success") {
            toast.success("Notiz erfolgreich gespeichert")
            return
        }
        toast.error("Fehler beim speichern der Notiz")
    }
    attendances.attendances.sort(GetSortOrderByCreatedAt("event"))
    return (
        <div className="overflow-x-auto">
        <div className="table">
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Lehrer</th>
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
                    {attendances.addable ? <td><form action={(event) => {handleStudentNoteChange(event, attendance.attendance.id)}} className="w-min"><input defaultValue={attendance.attendance.studentNote} type="text" placeholder="Schüler Noitz" name="Note" className="border-gray-200 border-2 rounded-md"></input><button type="submit" className="hover:underline">Speichern</button></form></td> : <td>{attendance.attendance.studentNote}</td>}
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