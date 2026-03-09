"use server";

import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { checkINUser, getEventPerID } from "@/app/src/modules/eventUtilities";
import dayjs from "dayjs";
import { saveSelectedStudyTimeFeedback } from "@/app/dashboard/events/event/[slug]/actions";
import db, { User } from "@/app/src/modules/db";

export async function addUserToStudyTime(userID: string, eventID: string) {
    const sessionUser: User = await getSessionUser(1);
    const event = await getEventPerID(eventID);
    if (!event) return "Die Studienzeit existiert nicht — vielleicht hat sie nie existiert";
    if (event.cw !== dayjs().isoWeek()) return "Die Studienzeit gehört einer vergangenen Epoche an";
    if (event.user !== sessionUser.id) return "Die Behörde verweigert dir den Zutritt";
    const data: User | string = await checkINUser(eventID, userID)
    return data;
};

export async function saveTrafficLightFeedback(eventID: string, userID: string, color: string) {
    const sessionUser: User = await getSessionUser(1);
    const event = await getEventPerID(eventID);
    if (!event) return "Die Studienzeit existiert nicht — vielleicht hat sie nie existiert";
    if (event.cw !== dayjs().isoWeek()) return "Die Studienzeit gehört einer vergangenen Epoche an";
    if (event.user !== sessionUser.id) return "Die Behörde verweigert dir den Zutritt";
    const attendance = await db.attendances.findFirst({
        where: {
            eventID: eventID,
            userID: userID
        }
    });
    if (!attendance) return "Die Anwesenheit wurde nicht gefunden — als wäre das Wesen nie hier gewesen";
    const result = await saveSelectedStudyTimeFeedback(attendance.id, color as "GREEN" | "YELLOW" | "RED", userID);
    return result;
};