import { getSessionUser } from "@/app/src/modules/authUtilities";
import UserEditForm from "./userEditForm.component";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import { notFound } from "next/navigation";
import { ldap_auto_groups, ldap_auto_permission, ldap_auto_studytime_data, studytime, use_ldap } from "@/app/src/modules/config";

export default async function userEdit(searchParams: { searchParams: SearchParams }) {
    await getSessionUser(2);
    const userData = await getUserPerID(searchParams.searchParams.userID);
    if (!userData.id) notFound();
    const config = new Array();
    config.push({
        "studyTime": studytime,
        "use_ldap": use_ldap,
        "ldap_auto_studytime_data": ldap_auto_studytime_data,
        "ldap_auto_groups": ldap_auto_groups,
        "ldap_auto_permission": ldap_auto_permission
    })
    return (
        <div>
            <h1>Nutzer bearbeiten</h1>
            <UserEditForm userData={userData} config={config}/>
        </div>
    );
}