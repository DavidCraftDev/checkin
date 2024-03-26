import { getServerSession } from "next-auth";
import { authOptions } from "@/app/src/modules/auth";
import { redirect } from "next/navigation";
import { getUserPerID } from "./userUtilities";

export async function getSesession() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/logout");
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
    if(!user.id) {
        redirect("/logout");
    }
    if(user.loginVersion != session.user.loginVersion) {
        redirect("/logout");
    }
    if(permission) {
        if(user.permission < permission) {
            redirect("/dashboard");
        }
    }
    return user;
}