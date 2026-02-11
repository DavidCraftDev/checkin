"use server";

import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { User } from "@/app/src/modules/db";
import { getEventPerID } from "@/app/src/modules/eventUtilities";
import { setAttendanceStatus } from "@/app/src/modules/lessonUtilities";
import dayjs from "dayjs";

export async function addUserToLesson(userID: string, eventID: string) {
    const sessionUser: User = await getSessionUser(1);
    const event = await getEventPerID(eventID);
    if (!event) return "Unterricht nicht gefunden";
    if (event.cw !== dayjs().isoWeek()) return "Unterricht ist nicht aktuell";
    if (event.user !== sessionUser.id) return "Keine Berechtigung";
    const data: User | string = await setAttendanceStatus(eventID, userID, true);
    return data;
};