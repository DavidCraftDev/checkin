import { getSesessionUser } from "@/app/src/modules/authUtilities";
import db from "@/app/src/modules/db"
import UserCreateForm from "./userCreateForm.component";

export default async function User() {
    const user = await getSesessionUser(2);
    const users = await db.user.findMany()
    return (
        <div>
            <h1>Nutzer erstellen</h1>
            <UserCreateForm />
        </div>
    );
}