"use server";

import { AttendancePerUserPerEvent } from "@/app/src/interfaces/events";

function CompletedStudyTimes(props: { attendances: AttendancePerUserPerEvent[] }) {
    // Function to get the name of the study time based on its type
    function getStudyTimeName(type: string) {
        if (type.startsWith("Notiz:")) {
            return type.replace("Notiz:", "") + " (Notiz)"
        } else if (type.startsWith("Vertretung:")) {
            return type.replace("Vertretung:", "") + " (Vertretung)"
        } else {
            return type
        }
    }

    // Sort attendances by study time type
    props.attendances.sort((a, b) => {
        const nameA = getStudyTimeName(a.attendance.type || "").toLowerCase();
        const nameB = getStudyTimeName(b.attendance.type || "").toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
    });
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Besuchte Studienzeiten</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.attendances.length > 0 ? (props.attendances.map((attendanceData) => (
                            <tr key={attendanceData.attendance.id}>
                                <td>{getStudyTimeName(attendanceData.attendance.type || "")}</td>
                            </tr>
                        ))) : (<tr><td className="italic">Keine Studienzeiten besucht</td></tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CompletedStudyTimes;