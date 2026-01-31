import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import UserEditForm from "./userEditForm.component";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import { notFound } from "next/navigation";
import { config_data } from "@/app/src/modules/data/config";
import { User } from "@/app/src/modules/db";

async function userEdit(searchParams: { searchParams: Promise<SearchParams> }) {
    await getSessionUser(2);
    const userData: User = await getUserPerID((await searchParams.searchParams).userID);
    if (!userData) notFound();
    const config = {
        "use_ldap": config_data.LDAP.ENABLE,
        "ldap_auto_studytime_data": config_data.LDAP.AUTOMATIC_DATA_DETECTION.STUDYTIME_DATA.ENABLE,
        "ldap_auto_groups": config_data.LDAP.AUTOMATIC_DATA_DETECTION.GROUPS.ENABLE,
        "ldap_auto_permission": config_data.LDAP.AUTOMATIC_DATA_DETECTION.PERMISSION.ENABLE,
    }
    return (
        <div>
            <h1>Nutzer bearbeiten</h1>
            <UserEditForm userData={userData} config={config} />
        </div>
    );
}

export default userEdit;