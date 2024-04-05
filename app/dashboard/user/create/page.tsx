import { getSesessionUser } from "@/app/src/modules/authUtilities";
import db from "@/app/src/modules/db"
import UserCreateForm from "./userCreateForm.component";

export default async function User() {
    await getSesessionUser(2);
    return (
        <div>
            <h1>Nutzer bearbeiten</h1>
            <UserCreateForm />
        </div>
    );
}