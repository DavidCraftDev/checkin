import { getSessionUser } from "@/app/src/modules/authUtilities";
import UserEditForm from "./userEditForm.component";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import { notFound } from "next/navigation";
import { studytime } from "@/app/src/modules/config";

export default async function userEdit(searchParams: { searchParams: SearchParams }) {
    await getSessionUser(2);
    const userData = await getUserPerID(searchParams.searchParams.userID);
    if (!userData.id) notFound();
    return (
        <div>
            <h1>Nutzer bearbeiten</h1>
            <UserEditForm userData={userData} studyTime={studytime} />
        </div>
    );
}