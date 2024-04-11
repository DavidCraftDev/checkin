import { redirect } from "next/navigation";
import { getSesessionUser } from "./src/modules/authUtilities";

export default async function notFound() {
    const user = await getSesessionUser();
    if (user.id) redirect('/dashboard');
    else redirect('/login');
}