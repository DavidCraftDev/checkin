import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import UserCreateForm from "./userCreateForm.component";
import { redirect } from "next/navigation";
import { config_data } from "@/app/src/modules/config/config";

async function userCreate() {
    if (config_data.LDAP.ENABLE) redirect("/dashboard/user");
    await getSessionUser(2);
    return (
        <div>
            <h1>Nutzer erstellen</h1>
            <UserCreateForm />
        </div>
    );
}

export default userCreate;