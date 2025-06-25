"use server";

import { functionResult } from "@/app/src/interfaces/utilties";
import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import db from "@/app/src/modules/db";
import { checkINHandler, createTeacherNote, deleteEmptyEvent } from "@/app/src/modules/eventUtilities";
import logger from "@/app/src/modules/logger";
import { getUserPerUsername, searchUser } from "@/app/src/modules/userUtilities";
import { Attendances, Events, User } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function handleEventDelete(eventID: string): Promise<void> {
    const data = await deleteEmptyEvent(eventID);
    revalidatePath("/dashboard/events/createdEvents");
    if (data) redirect("/dashboard/events/createdEvents");
}

export async function handleUserCheckIN(username: string, event: Events): Promise<functionResult> {
    const sessionUser = await getSessionUser(1);
    if (!sessionUser || event.user !== sessionUser.id) redirect("/dashboard");
    const user = await getUserPerUsername(username);
    if (!user) return { success: false, error: "Schüler nicht gefunden" };
    const data = await checkINHandler(event.id, user.id);
    if (data && typeof data === "string") return { success: false, error: data };
    else if (data && typeof data === "object") return { success: true, data: user };
    return { success: false, error: "Unbekannter Fehler" };
}

export async function searchUserHandler(search: string): Promise<User[]> {
    const users = await searchUser(search);
    return users;
}

export async function removeUserHandler(attendance: Attendances, user: User, removeUser: User): Promise<Attendances> {
    logger.info(user.displayname + " hat " + removeUser.displayname + " aus der Studienzeit mit der ID " + attendance.eventID + " entfernt", "Event");
    return await db.attendances.delete({
        where: {
            id: attendance.id
        }
    });
}

export async function setTeacherNote(teacherNote: string, attendanceID: string): Promise<functionResult> {
    const data = await createTeacherNote(attendanceID, teacherNote);
    revalidatePath("/dashboard/events/attendedEvents");
    if (data && data.teacherNote === teacherNote) return { success: true };
    return { success: false, error: "Notiz konnte nicht gespeichert werden" };
}

export async function saveSelectedStudyTimeFeedback(attendance: Attendances, staus: "GREEN" | "YELLOW" | "RED", userID: string): Promise<functionResult> {
    const sessionUser = await getSessionUser(1);
    if (!sessionUser || (sessionUser.id !== userID && sessionUser.permission < 2)) {
        return { success: false, error: "Keine Berechtigung zum Speichern" };
    }
    const data = await db.attendances.update({
        where: { id: attendance.id },
        data: { feedback: staus }
    });
    revalidatePath("/dashboard/events/attendedEvents");
    if (data) {
        logger.info(`Studienzeit Status für ${attendance.id} auf ${staus} gesetzt`, "saveSelectedStudyTimeFeedback");
        return { success: true };
    }
    logger.error(`Studienzeit Status für ${attendance.id} konnte nicht gespeichert werden`, "saveSelectedStudyTimeFeedback");
    return { success: false, error: "Studienzeit Status konnte nicht gespeichert werden" };
}