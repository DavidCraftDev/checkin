import { getServerSession } from "next-auth";
import { authOptions } from "@/app/src/modules/auth";
import { redirect } from "next/navigation";
import { getUserPerID } from "./userUtilities";

export async function getSesession() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/api/auth/signin");
    }
    return session;
}

export async function getSesessionUser() {
    const session = await getSesession();
    return await getUserPerID(session.user.id);
}