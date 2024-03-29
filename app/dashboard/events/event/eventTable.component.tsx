"use client"

import moment from "moment";
import setTeacherNote from "./teacherNoteHandler";
import toast from "react-hot-toast";


async function EventTable(attendances: any) {
    async function handleTeacherNoteChange(event: any, attendanceID: any) {
        const data = await setTeacherNote(event, attendanceID)
        if(data === "success") {
            toast.success("Notiz erfolgreich gespeichert")
            return
        }
        toast.error("Fehler beim speichern der Notiz")
    }
    return (
        <div className="overflow-x-auto">
        <div className="table">
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Schüler Notiz</th>
                    <th>Lehrer Notiz</th>
                    <th>Wann hinzugefügt</th>
                </tr>
            </thead>
            <tbody>
            {attendances.attendances.map((attendance: any) => (
                <tr key={attendance.attendance.id}>
                    <td>{attendance.user.displayname}</td>
                    <td>{attendance.attendance.studentNote}</td>
                    {attendances.addable ? <td><form action={(event) => {handleTeacherNoteChange(event, attendance.attendance.id)}} className="w-min"><input defaultValue={attendance.attendance.teacherNote} type="text" placeholder="Lehrer Noitz" name="Note" className="border-gray-200 border-2 rounded-md"></input><button type="submit" className="hover:underline">Speichern</button></form></td> : <td>{attendance.attendance.teacherNote}</td>}
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