import "server-only";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/src/modules/auth";
import { redirect } from "next/navigation";
import { getUserPerID } from "./userUtilities";

export async function getSession() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/login");
    }
    return session;
}

export async function getSessionUser(permission?: number) {
    const session = await getSession();
    if (permission && session.user.permission < permission) {
        redirect("/dashboard");
    }
    const user = await getUserPerID(session.user.id, true);
    if (!user.id || user.loginVersion !== session.user.loginVersion) {
        redirect("/logout");
    } else if (permission && user.loginVersion != session.user.loginVersion) {
        redirect("/dashboard");
    }
    return user;
}