"use server";

import { getSessionUser } from "@/lib/auth/cookieManager";
import { getEventPerID } from "@/lib/events";
import { setAttendanceStatus } from "@/lib/lessons";
import { User } from "@prisma/client";
import dayjs from "dayjs";

export async function submitHandler(userID: string, eventID: string) {
    const sessionUser: User = await getSessionUser(1);
    const event = await getEventPerID(eventID);
    if (!event) return "EventNotFound";
    if(event.cw !== dayjs().isoWeek()) return "NotCurrentWeek";
    if (event.user !== sessionUser.id) return "NoPermission";
    const data: User | string = await setAttendanceStatus(eventID, userID, true);
    return data;
};