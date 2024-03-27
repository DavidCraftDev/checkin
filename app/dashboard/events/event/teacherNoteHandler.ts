import { FormEvent } from "react";

function setTeacherNote(event: FormData, attendanceID?: any) {
    console.log(event.get("Note"))
    console.log(attendanceID)
    console.log("Yeah")
}

export default setTeacherNote;