"use server";

import TrafficLight from "../../events/attendedEvents/trafficLight";
import AttendedStudyTimes from "./attenedStudyTimes.component";
import { GroupMember } from "@/types/groups";

interface AttendanceCount {
    normal: number,
    parallel: number,
    noted: number
    needed: number
    trafficLight: number
}

interface GroupTableProps {
    user: GroupMember[],
    studyTimeData: Record<string, AttendanceCount>,
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
                        {props.user.map((user) => {
                            if (user.user.needs.length === 0 && user.user.permission !== 0) return null;
                            // 1 = GREEN 2 = YELLOW 3 = RED
                            const roundedTrafficLight = Math.round(props.studyTimeData[user.user.id].trafficLight);
                            let status: "GREEN" | "YELLOW" | "RED";
                            if (roundedTrafficLight === 1) {
                                status = "GREEN";
                            } else if (roundedTrafficLight === 2) {
                                status = "YELLOW";
                            } else {
                                status = "RED";
                            }
                            return (
                                <tr key={user.user.id}>
                                    <td>{user.user.displayName}</td>
                                    <td><AttendedStudyTimes studyTimeData={props.studyTimeData[user.user.id]} /><TrafficLight status={status} /></td>
                                    <td><a href={`/dashboard/events/attendedEvents?userID=${user.user.id}&cw=${props.cw}&year=${props.year}`} className="hover:underline">Anzeigen</a></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default GroupTable;