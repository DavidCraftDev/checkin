import db from "@/app/src/modules/db"
import UserTable from "./userTable.component";
import { use_ldap } from "@/app/src/modules/config";
import { getSessionUser } from "@/app/src/modules/auth/cookieManager";

async function user() {
    await getSessionUser(2);
    const users = await db.user.findMany() || [];
    users.sort((a, b) => a.username.localeCompare(b.username));
    return (
        <div>
            <div className="grid grid-rows-1 grid-cols-2">
                <div>
                    <h1>Nutzer</h1>
                    <p>{users.length} Nutzer</p>
                </div>
                {!use_ldap ? <a className="btn place-self-center" href={`/dashboard/user/create`}>Nutzer erstellen</a> : null}
            </div>
            <UserTable users={users} />
            <p>Exportieren als:
                <a href="/export/user/json" download="users.json" className="hover:underline mx-1">JSON</a>
                <a href="/export/user/xlsx" download="users.xlsx" className="hover:underline mx-1">XLSX</a>
            </p>
        </div>
    );
}

export default user;