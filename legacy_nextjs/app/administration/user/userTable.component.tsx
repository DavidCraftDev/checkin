"use server";

import { User } from "@prisma/client";

const permissionMap: { [key: number]: string } = {
    0: "Schüler",
    1: "Lehrer",
    2: "Administrator"
};

function UserTable(props: { users: User[] }) {
    return (
        <div className="overflow-x-auto">
            <div className="table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Benutzername</th>
                            <th>Nutzergruppe</th>
                            <th>Gruppen</th>
                            <th>Bearbeiten</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.users.map((user: User) => (
                            <tr key={user.id}>
                                <td>{user.displayname}</td>
                                <td>{user.username}</td>
                                <td>{permissionMap[user.permission]}</td>
                                <td>{user.group.toString().replaceAll(",", ", ")}</td>
                                <td><a href={`/administration/user/edit?userID=${user.id}`} className="hover:underline">Bearbeiten</a></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserTable;