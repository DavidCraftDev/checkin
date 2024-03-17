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

export async function getSesessionUser(permission?: Number) {
    const session = await getSesession();
    if(permission) {
        if(session.user.permission < permission) {
            redirect("/dashboard");
        }
    }
    const user = await getUserPerID(session.user.id);
    if(permission) {
        if(user.permission < permission) {
            redirect("/dashboard");
        }
    }
    return user;
}