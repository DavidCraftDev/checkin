"use server";

import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { User } from "@/app/src/modules/db";
import { getEventPerID } from "@/app/src/modules/eventUtilities";
import { setAttendanceStatus } from "@/app/src/modules/lessonUtilities";
import dayjs from "dayjs";

export async function addUserToLesson(userID: string, eventID: string) {
    const sessionUser: User = await getSessionUser(1);
    const event = await getEventPerID(eventID);
    if (!event) return "Der Unterricht existiert nicht — als hätte ihn jemand aus der Wirklichkeit gestrichen";
    if (event.cw !== dayjs().isoWeek()) return "Der Unterricht gehört einer vergangenen Epoche an";
    if (event.user !== sessionUser.id) return "Die Behörde verweigert dir den Zutritt";
    const data: User | string = await setAttendanceStatus(eventID, userID, true);
    return data;
};