import { getSesessionUser } from "@/app/src/modules/authUtilities";
import UserCreateForm from "./userCreateForm.component";

export default async function userCreate() {
    await getSesessionUser(2);
    return (
        <div>
            <h1>Nutzer erstellen</h1>
            <UserCreateForm />
        </div>
    );
}