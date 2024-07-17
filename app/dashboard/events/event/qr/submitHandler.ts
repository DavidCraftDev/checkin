"use server";

import { getSessionUser } from "@/app/src/modules/authUtilities";
import { checkINHandler, getEventPerID } from "@/app/src/modules/eventUtilities";
import { Events, User } from "@prisma/client";

export async function submitHandler(userID: string, eventID: string) {
    const sessionUser: User = await getSessionUser(1);
    const event: Events = await getEventPerID(eventID);
    if (event.user !== sessionUser.id) return "NoPermission";
    const data: User | string = await checkINHandler(eventID, userID)
    return data;
};