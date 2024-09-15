"use client";

import AttendedStudyTimes from "./attenedStudyTimes.component";
import { GroupMember } from "@/app/src/interfaces/groups";

interface attendaceCount {
    normal: number,
    parallel: number,
    noted: number
    needed: number
}

interface GroupTableProps {
    user: GroupMember[],
    studyTimeData: Record<string, attendaceCount>,
    cw: number,
    year: number
}

function GroupTable(props: GroupTableProps) {
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Teilgenommene Studienzeiten</th>
                            <th>Anzeigen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.user.map((user) => (
                            <tr key={user.user.id}>
                                <td>{user.user.displayname}</td>
                                <td><AttendedStudyTimes studyTimeData={props.studyTimeData[user.user.id]} /></td>
                                <td><a href={`/dashboard/events/attendedEvents?userID=${user.user.id}&cw=${props.cw}&year=${props.year}`} className="hover:underline">Anzeigen</a></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default GroupTable;