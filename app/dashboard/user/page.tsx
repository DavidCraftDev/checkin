import { getSesessionUser } from "@/app/src/modules/authUtilities";
import db from "@/app/src/modules/db"
import UserTable from "./userTable.component";
import CreateUserButton from "./createUserButton.component";

export default async function User() {
    const user = await getSesessionUser(2);
    const users = await db.user.findMany()
    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-2">
                <div>
                    <h1>Nutzer</h1>
                    <p>{users.length} Nutzer</p>
                </div>
                <CreateUserButton />
            </div>
            <UserTable users={users} />
            <a href="/export/user/json" download="users.json" className="hover:underline">Exportieren</a>
        </div>
    );
}