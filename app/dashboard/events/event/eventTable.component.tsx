"use client"

import moment from "moment";
import setTeacherNote from "./teacherNoteHandler";
import toast from "react-hot-toast";


function EventTable(attendances: any) {
    let cooldown: number = 0;
    let currentNote: string = ""
    async function setTeacherNoteHandler(teacherNote: string, attendanceID: any) {
        const data = await setTeacherNote(teacherNote, attendanceID)
        if (data === "success") {
            toast.success("Notiz erfolgreich gespeichert")
            return
        }
        toast.error("Fehler beim speichern der Notiz")
    }
    async function handleTeacherNoteChange(teacherNote: string, attendanceID: any) {
        if (cooldown > 0) {
            cooldown = 50
            currentNote = teacherNote
            return
        } else {
            cooldown = 50
            currentNote = teacherNote
            while (cooldown > 0) {
                cooldown--;
                await new Promise(r => setTimeout(r, 1));
                if (cooldown === 0) {
                    setTeacherNoteHandler(currentNote, attendanceID)
                }
            }
        }
    }
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            {attendances.studyTime ? <th>Fach</th> : null}
                            <th>Schüler Notiz</th>
                            <th>Lehrer Notiz</th>
                            <th>Wann hinzugefügt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendances.attendances.map((attendance: any) => (
                            <tr key={attendance.attendance.id}>
                                <td>{attendance.user.displayname}</td>
                                {attendances.studyTime ? attendance.attendance.type ? <td>{attendance.attendance.type.replace("parallel:", "Vertretung:").replace("note:", "Notiz:")}</td> : <td>❌</td> : null}
                                <td>{attendance.attendance.studentNote}</td>
                                {attendances.addable ? <td><textarea defaultValue={attendance.attendance.teacherNote} onChange={(e) => handleTeacherNoteChange(e.target.value, attendance.attendance.id)} placeholder="Lehrer Notiz" name="Note" className="border-gray-200 border-2 rounded-md"></textarea></td> : <td>{attendance.attendance.teacherNote}</td>}
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
