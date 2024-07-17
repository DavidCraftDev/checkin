"use client";

import { User } from "@prisma/client";

interface UserTableProps {
    users: User[];
}

function UserTable(props: UserTableProps) {
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Benutzername</th>
                            <th>Rechte</th>
                            <th>Gruppe</th>
                            <th>Bearbeiten</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.users.map((user: User) => (
                            <tr key={user.id}>
                                <td>{user.displayname}</td>
                                <td>{user.username}</td>
                                <td>{user.permission}</td>
                                <td>{user.group}</td>
                                <td><a href={`/dashboard/user/edit?userID=${user.id}`} className="hover:underline">Bearbeiten</a></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserTable;