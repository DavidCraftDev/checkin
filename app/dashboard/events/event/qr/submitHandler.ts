"use server";

import { getSessionUser } from "@/app/src/modules/authUtilities";
import { checkINHandler, getEventPerID } from "@/app/src/modules/eventUtilities";
import { User } from "@prisma/client";
import dayjs from "dayjs";

export async function submitHandler(userID: string, eventID: string) {
    const sessionUser: User = await getSessionUser(1);
    const event = await getEventPerID(eventID);
    if (!event) return "EventNotFound";
    if(event.cw !== dayjs().isoWeek()) return "NotCurrentWeek";
    if (event.user !== sessionUser.id) return "NoPermission";
    const data: User | string = await checkINHandler(eventID, userID)
    return data;
};