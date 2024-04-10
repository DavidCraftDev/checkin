"use client";

import moment from "moment";

function GroupTable(users: any) {
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Teilgenommene Events</th>
                            <th>Anzeigen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.user.map((user: any) => (
                            <tr key={user.user.id}>
                                <td>{user.user.displayname}</td>
                                <td>{user.attendances}</td>
                                <td><a href={`/dashboard/events/attendedEvents?userID=${user.user.id}&cw=${users.cw}&year=${users.year}`} className="hover:underline">Anzeigen</a></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default GroupTable;