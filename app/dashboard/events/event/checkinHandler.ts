"use server"

import { getSessionUser } from "@/app/src/modules/authUtilities";
import { checkINHandler } from "@/app/src/modules/eventUtilities";
import { getUserPerUsername, searchUser } from "@/app/src/modules/userUtilities";
import { Events } from "@prisma/client";

export async function submitHandler(username: string, event: Events) {
    const sessionUser = await getSessionUser(1);
    if (event.user !== sessionUser.id) return "NoPermission";
    const user = await getUserPerUsername(username);
    if (!user) return "UserNotFound";
    const data = await checkINHandler(event.id, user.id)
    return data;
}

export async function searchHandler(search: string) {
    const user = await searchUser(search);
    return user;
}