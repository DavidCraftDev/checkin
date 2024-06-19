"use server";

import { getSessionUser } from "@/app/src/modules/authUtilities";
import { checkINHandler, getEventPerID } from "@/app/src/modules/eventUtilities";
import { existUserPerID } from "@/app/src/modules/userUtilities"

export async function submitHandler(userID: any, eventID: any) {
    const sessionUser = await getSessionUser(1);
    const event = await getEventPerID(eventID);
    if (event.user !== sessionUser.id) return;
    const userExist = await existUserPerID(userID)
    if (!userExist) return "UserNotFound"
    const data = await checkINHandler(eventID, userID)
    return data;
};