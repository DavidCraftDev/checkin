"use server";

import { functionResult } from "@/types/utilties";
import { getSessionUser } from "@/lib/auth/cookieManager";
import db from "@/lib/db";
import { checkINHandler, createTeacherNote, deleteEmptyEvent } from "@/lib/events";
import logger from "@/lib/logger";
import { getUserPerUsername, searchUser } from "@/lib/users";
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
    logger.info(user.displayName + " hat " + removeUser.displayName + " aus der Studienzeit mit der ID " + attendance.eventId + " entfernt", "Event");
    return await db.attendance.delete({
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

export async function saveSelectedStudyTimeFeedback(attendanceID: string, status: "GREEN" | "YELLOW" | "RED", userID: string): Promise<functionResult> {
    const sessionUser = await getSessionUser(1);
    if (!sessionUser || sessionUser.permission === 0) {
        return { success: false, error: "Keine Berechtigung zum Speichern" };
    }
    const data = await db.attendance.update({
        where: { id: attendanceID },
        data: { feedback: status }
    });
    revalidatePath("/dashboard/events/attendedEvents");
    if (data) {
        logger.info(`Studienzeit Status für ${attendanceID} auf ${status} gesetzt`, "saveSelectedStudyTimeFeedback");
        return { success: true };
    }
    logger.error(`Studienzeit Status für ${attendanceID} konnte nicht gespeichert werden`, "saveSelectedStudyTimeFeedback");
    return { success: false, error: "Studienzeit Status konnte nicht gespeichert werden" };
}