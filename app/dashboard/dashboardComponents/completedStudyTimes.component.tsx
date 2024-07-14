"use client";

import { Attendance } from "@prisma/client";

interface CompletedStudyTimesProps {
    hasStudyTimes: Attendance[];
}

function CompletedStudyTimes(props: CompletedStudyTimesProps) {
    function getStudyTimeName(type: string) {
        if (type.startsWith("note:")) {
            return type.replace("note:", "") + " (Notiz)"
        } else if (type.startsWith("parallel:")) {
            return type.replace("parallel:", "") + " (Vertretung)"
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
                            <th>Erledigte Studienzeiten</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.hasStudyTimes.map((studyTime: Attendance) => {
                            return (
                                <tr key={studyTime.id}>
                                    <td>{getStudyTimeName(studyTime.type || "")}</td>
                                </tr>
                            )
                        })}
                        {props.hasStudyTimes.length === 0 ? <tr><td className="italic">Keine Studienzeiten erledigt</td></tr> : null}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CompletedStudyTimes;