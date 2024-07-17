"use client";

interface groupData {
    group: string,
    members: number
}

interface GroupsTableProps {
    groups: groupData[]
}

function GroupsTable(props: GroupsTableProps) {
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
                        {props.groups.map((group: any) => (
                            <tr key={group.group}>
                                <td>{group.group}</td>
                                <td>{group.members} Teilnehmer</td>
                                <td><a href={`/dashboard/groups/group?groupID=${group.group}`} className="hover:underline">Anzeigen</a></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default GroupsTable;