import { getServerSession } from "next-auth";
import { authOptions } from "@/app/src/modules/auth";
import { redirect } from "next/navigation";

export async function getSesession() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/api/auth/signin");
    }
    return session;
}