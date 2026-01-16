"use client";

import { Categories } from "@/lib/overview/user";
import { TableOverviewChart } from "../../forms";

function UserOverviewTable(props: { data: { [key: string]: Categories }, userID: string }) {
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Kalendarwoche</th>
                            <th>Teilgenommene Studienzeiten</th>
                            <th>Anzeigen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(props.data).map((key) => {
                            const cw = key.split("-")[1];
                            const year = key.split("-")[0];
                            return (
                                <tr key={key}>
                                    <td>{cw + "/" + year}</td>
                                    <td><TableOverviewChart categories={props.data[key]} /></td>
                                    <td><a href={`/dashboard/events/attendedEvents?userID=${props.userId}&cw=${cw}&year=${year}`} className="hover:underline">Anzeigen</a></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default UserOverviewTable;