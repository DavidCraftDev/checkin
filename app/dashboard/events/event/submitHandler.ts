"use server"

import { getSessionUser } from "@/app/src/modules/authUtilities";
import { checkINHandler, getEventPerID } from "@/app/src/modules/eventUtilities";
import { getUserID } from "@/app/src/modules/userUtilities";

export async function submitHandler(username: string, eventID: string) {
    const sessionUser = await getSessionUser(1);
    const event = await getEventPerID(eventID);
    if (event.user !== sessionUser.id) return "NoPermission";
    const userID: string = await getUserID(username);
    const data = await checkINHandler(eventID, userID)
    return data;
}