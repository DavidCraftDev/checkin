"use client";

import { Groups } from "@/app/src/interfaces/groups";

interface GroupsTableProps {
    groups: Groups[];
}

function MyGroupsTable(props: GroupsTableProps) {
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Gruppenname</th>
                            <th>Teilnehmer</th>
                            <th>Anzeigen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.groups.map((group) => (
                            <tr key={group.group}>
                                <td>{group.group}</td>
                                <td>{group.members} Teilnehmer</td>
                                <td><a href={`/dashboard/groups/group?groupID=${group.group}`} className="hover:underline">Anzeigen</a></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {props.groups.length === 0 ? <p className="text-center italic m-2">Keine Gruppen vorhanden</p> : null}
            </div>
        </div>
    )
}

export default MyGroupsTable;