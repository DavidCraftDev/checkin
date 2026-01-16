"use client";

import { SortedData } from "@/app/src/modules/overview/user";
import { TableOverviewChart } from "../../forms";
import { User } from "@prisma/client";

function GroupOverviewTable(props: { data: { [key: string]: SortedData }, users: User[], startCW: number, startYear: number, endCW: number, endYear: number }) {
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Schüler</th>
                            <th>Teilgenommene Studienzeiten</th>
                            <th>Anzeigen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(props.data).map((key) => {
                            const user = props.users.find(user => user.id === key);
                            if (!user) return null;
                            if (user.needs.length === 0 && user.permission !== 0) return null;
                            return (
                                <tr key={key}>
                                    <td>{user.displayname}</td>
                                    <td><TableOverviewChart categories={props.data[key].categories} /></td>
                                    <td><a href={`/dashboard/overview/user/${user.id}?startCW=${props.startCW}&startYear=${props.startYear}&endCW=${props.endCW}&endYear=${props.endYear}`} className="hover:underline">Anzeigen</a></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default GroupOverviewTable;