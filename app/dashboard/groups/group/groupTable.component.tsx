"use client";

import AttendedStudyTimes from "./attenedStudyTimes.component";

function GroupTable(props: any) {
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