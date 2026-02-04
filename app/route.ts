import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";
import { redirect } from "next/navigation";

export async function GET() {
    const { session } = await getCurrentSession();
    if (session) redirect("/dashboard");
    else redirect("/login");
}