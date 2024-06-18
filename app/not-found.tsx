import { redirect } from "next/navigation";
import { getSessionUser } from "./src/modules/authUtilities";

export default async function notFound() {
    const user = await getSessionUser();
    if (user.id) redirect('/dashboard');
    else redirect('/login');
}