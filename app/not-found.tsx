import { redirect } from "next/navigation";
import { getCurrentSession } from "./src/modules/auth/cookieManager";

export default async function notFound() {
    const { session } = await getCurrentSession();
    if (session) redirect('/dashboard');
    else redirect('/login');
}