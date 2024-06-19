import { getSessionUser } from "@/app/src/modules/authUtilities";
import UserCreateForm from "./userCreateForm.component";
import { isStudyTimeEnabled } from "@/app/src/modules/studytimeUtilities";

export default async function userCreate() {
    await getSessionUser(2);
    const studyTime: boolean = await isStudyTimeEnabled();
    return (
        <div>
            <h1>Nutzer erstellen</h1>
            <UserCreateForm studyTime={studyTime} />
        </div>
    );
}