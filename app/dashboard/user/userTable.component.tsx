"use client";

import { User } from "@prisma/client";

function UserTable(users: any) {
    return (
        <div className="w-full mt-4 p-2 pb-0 border-gray-200 border-2 rounded-md overflow-y-scroll">
        <table className="table-auto w-full text-left">
            <thead>
                <tr className="border-b border-gray-600">
                    <th className="py-4 px-2">Name</th>
                    <th className="py-4 px-2">Benutzername</th>
                    <th className="py-4 px-2">Rechte</th>
                    <th className="py-4 px-2">Gruppe</th>
                    <th className="py-4 px-2">Bearbeiten</th>
                </tr>
            </thead>
            <tbody>
            {users.users.map((user: any) => (
                <tr key={user.id} className="border-b border-gray-200">
                    <td className="p-2">{user.displayname}</td>
                    <td className="p-2">{user.username}</td>
                    <td className="p-2">{user.permission}</td>
                    <td className="p-2">{user.group}</td>
                    <td className="p-2"><a href={`/dashboard/user/edit?userID=${user.id}`} className="hover:underline">Bearbeiten</a></td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
}

export default UserTable;