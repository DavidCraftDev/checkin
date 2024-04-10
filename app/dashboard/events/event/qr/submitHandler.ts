"use server";

import { getSesessionUser } from "@/app/src/modules/authUtilities";
import { checkINHandler, getEventPerID } from "@/app/src/modules/eventUtilities";
import { existUserPerID } from "@/app/src/modules/userUtilities"

export async function submitHandler(userID: any, eventID: any) {
    const sessionUser = await getSesessionUser(1);
    const event = await getEventPerID(eventID);
    if (event.user !== sessionUser.id) return;
    const userExist = await existUserPerID(userID)
    if (!userExist) return "UserNotFound"
    const data = await checkINHandler(eventID, userID)
    return data;
};