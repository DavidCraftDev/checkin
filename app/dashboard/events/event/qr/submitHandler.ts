"use server";

import { getSessionUser } from "@/lib/auth/cookieManager";
import { checkINHandler, getEventPerID } from "@/lib/events";
import { User } from "@prisma/client";
import dayjs from "dayjs";
import { saveSelectedStudyTimeFeedback } from "../actions";
import db from "@/lib/db";

export async function checkinUserHandler(userID: string, eventID: string) {
    const sessionUser: User = await getSessionUser(1);
    const event = await getEventPerID(eventID);
    if (!event) return "Die Studienzeit wurde nicht gefunden";
    if (event.cw !== dayjs().isoWeek()) return "Die Studienzeit ist nicht aktuell";
    if (event.user !== sessionUser.id) return "Keine Berechtigung";
    const data: User | string = await checkINHandler(eventID, userID)
    return data;
};

export async function saveTrafficLightFeedback(eventID: string, userID: string, color: string) {
    const sessionUser: User = await getSessionUser(1);
    const event = await getEventPerID(eventID);
    if (!event) return "Die Studienzeit wurde nicht gefunden";
    if (event.cw !== dayjs().isoWeek()) return "Die Studienzeit ist nicht aktuell";
    if (event.user !== sessionUser.id) return "Keine Berechtigung";
    const attendance = await db.attendance.findFirst({
        where: {
            eventID: eventID,
            userID: userID
        }
    });
    if (!attendance) return "Die Anwesenheit wurde nicht gefunden";
    const result = await saveSelectedStudyTimeFeedback(attendance.id, color as "GREEN" | "YELLOW" | "RED", userID);
    return result;
};