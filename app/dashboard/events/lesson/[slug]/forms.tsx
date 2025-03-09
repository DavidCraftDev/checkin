"use client";

import toast from "react-hot-toast";
import { setAttendanceStatus } from "./actions";
import { useRouter } from "next/navigation";

export function StudentAttendButton(props: { attendanceID: string, attended: boolean } ): JSX.Element {
    const router = useRouter();
    async function setAttendance() {
        const data = await setAttendanceStatus(props.attendanceID, !props.attended);
        if(data && data.success) {
            toast.success("Status erfolgreich geändert");
        } else if(data && data.error) {
            toast.error(data.error);
        } else {
            toast.error("Ein unbekannter Fehler ist aufgetreten");
        }
        router.refresh();
    }
    return (
        <button onClick={setAttendance} className="rounded-sm m-1 p-1 hover:underline hover:bg-gray-50 border-2 border-gray-300 shadow-md transition-transform transform active:scale-95">{props.attended ? "Nicht anwesend" : "Anwesend"}</button>
    )
}