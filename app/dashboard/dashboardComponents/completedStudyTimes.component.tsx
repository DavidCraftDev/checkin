"use client";

import { AttendancePerUserPerEvent } from "@/app/src/interfaces/events";

interface CompletedStudyTimesProps {
    attendances: AttendancePerUserPerEvent[];
}

function CompletedStudyTimes(props: CompletedStudyTimesProps) {
    function getStudyTimeName(type: string) {
        if (type.startsWith("Notiz:")) {
            return type.replace("Notiz:", "") + " (Notiz)"
        } else if (type.startsWith("Vertretung:")) {
            return type.replace("Vertretung:", "") + " (Vertretung)"
        } else {
            return type
        }
    }
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