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
    studyTime: boolean,
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
                            <th>Teilgenommene Events</th>
                            {props.studyTime ? <th>Studienzeiten</th> : null}
                            <th>Anzeigen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.user.map((user: any) => (
                            <tr key={user.user.id}>
                                <td>{user.user.displayname}</td>
                                <td>{user.attendances}</td>
                                {props.studyTime ? <td><AttendedStudyTimes studyTimeData={props.studyTimeData[user.user.id]} /></td> : null}
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