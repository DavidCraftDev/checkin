"use client"

import moment from "moment";
import setTeacherNote from "./teacherNoteHandler";


function EventTable(attendances: any) {
    return (
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
                    {attendances.addable ? <td><form action={(event) => {setTeacherNote(event, attendance.attendance.id)}} className="w-min"><input defaultValue={attendance.attendance.teacherNote} type="text" placeholder="Lehrer Noitz" name="Note" className="border-gray-200 border-2 rounded-md"></input><button type="submit" className="hover:underline">Speichern</button></form></td> : <td>{attendance.attendance.teacherNote}</td>}
                    <td>{moment(Date.parse(attendance.attendance.created_at)).format("DD.MM.YYYY HH:mm")}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    )
}

export default EventTable;