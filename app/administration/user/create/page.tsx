import { getSessionUser } from "@/lib/auth/cookieManager";
import UserCreateForm from "./userCreateForm.component";
import { redirect } from "next/navigation";
import { config_data } from "@/lib/data/config";

async function UserCreatePage() {
    await getSessionUser(2);
    if (config_data.LDAP.ENABLE) redirect("/administration/user");
    return (
        <div>
            <h1>Nutzer erstellen</h1>
            <UserCreateForm />
        </div>
    );
}

export default UserCreatePage;