"use server"

import { getSessionUser } from "@/app/src/modules/authUtilities";
import { checkINHandler, getEventPerID } from "@/app/src/modules/eventUtilities";
import { getUserPerUsername } from "@/app/src/modules/userUtilities";

export async function submitHandler(username: string, eventID: string) {
    const sessionUser = await getSessionUser(1);
    const event = await getEventPerID(eventID);
    if (!event) return "EventNotFound";
    if (event.user !== sessionUser.id) return "NoPermission";
    const user = await getUserPerUsername(username);
    if (!user) return "UserNotFound";
    const data = await checkINHandler(eventID, user.id)
    return data;
}