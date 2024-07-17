import { getSessionUser } from "@/app/src/modules/authUtilities";
import UserCreateForm from "./userCreateForm.component";
import { redirect } from "next/navigation";
import { studytime, use_ldap } from "../../../src/modules/config";

async function userCreate() {
    if (use_ldap) redirect("/dashboard/user");
    await getSessionUser(2);
    return (
        <div>
            <h1>Nutzer erstellen</h1>
            <UserCreateForm studyTime={studytime} />
        </div>
    );
}

export default userCreate;