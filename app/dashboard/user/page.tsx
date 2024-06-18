import { getSessionUser } from "@/app/src/modules/authUtilities";
import db from "@/app/src/modules/db"
import UserTable from "./userTable.component";
import CreateUserButton from "./createUserButton.component";

export default async function user() {
    const user = await getSessionUser(2);
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
            <p>Exportieren als:
                <a href="/export/user/json" download="users.json" className="hover:underline mx-1">JSON</a>
                <a href="/export/user/xlsx" download="users.xlsx" className="hover:underline mx-1">XLSX</a>
            </p>
        </div>
    );
}