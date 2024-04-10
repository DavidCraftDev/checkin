import { getSesessionUser } from "@/app/src/modules/authUtilities";
import UserEditForm from "./userEditForm.component";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import { getUserPerID } from "@/app/src/modules/userUtilities";

export default async function User(searchParams: { searchParams: SearchParams }) {
    await getSesessionUser(2);
    const userData = await getUserPerID(searchParams.searchParams.userID);
    return (
        <div>
            <h1>Nutzer bearbeiten</h1>
            <UserEditForm userData={userData} />
        </div>
    );
}