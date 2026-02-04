import { deleteSessionTokenCookie, getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { invalidateSession } from "@/app/src/modules/auth/sessionManager";
import { redirect } from "next/navigation";

export async function GET(): Promise<never> {
    const { session } = await getCurrentSession();
    if (session) await invalidateSession(session.id);
    await deleteSessionTokenCookie();
    return redirect("/login");
}