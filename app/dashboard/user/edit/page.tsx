import { getSessionUser } from "@/app/src/modules/authUtilities";
import UserEditForm from "./userEditForm.component";
import { SearchParams } from "@/app/src/interfaces/searchParams";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import { notFound } from "next/navigation";
import { isStudyTimeEnabled } from "@/app/src/modules/studytimeUtilities";

export default async function userEdit(searchParams: { searchParams: SearchParams }) {
    await getSessionUser(2);
    const userData = await getUserPerID(searchParams.searchParams.userID);
    if (!userData.id) notFound();
    const studyTime: boolean = await isStudyTimeEnabled();
    return (
        <div>
            <h1>Nutzer bearbeiten</h1>
            <UserEditForm userData={userData} studyTime={studyTime} />
        </div>
    );
}