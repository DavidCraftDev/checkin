"use server";

import { functionResult } from "@/app/src/interfaces/utilties";
import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import db, { Attendances, Events, User } from "@/app/src/modules/db";
import { checkINUser, createTeacherNote, deleteEmptyEvent } from "@/app/src/modules/eventUtilities";
import logger from "@/app/src/modules/logger";
import { getUserPerUsername, searchUser } from "@/app/src/modules/userUtilities";
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
    if (!user) return { success: false, error: "Das gesuchte Wesen konnte in den Akten nicht gefunden werden" };
    const data = await checkINUser(event.id, user.id);
    if (data && typeof data === "string") return { success: false, error: data };
    else if (data && typeof data === "object") return { success: true, data: user };
    return { success: false, error: "Ein Fehler ohne Namen und Gesicht ist erschienen" };
}

export async function searchUserHandler(search: string): Promise<User[]> {
    const users = await searchUser(search);
    return users;
}

export async function removeUserHandler(attendance: Attendances, user: User, removeUser: User): Promise<Attendances> {
    logger.info(user.displayname + " hat " + removeUser.displayname + " aus der Studienzeit " + attendance.eventID + " getilgt — die Akten wurden entsprechend bereinigt", "Event");
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
    return { success: false, error: "Die Notiz wurde vom System zurückgewiesen — die Gründe bleiben im Dunkeln" };
}

export async function saveSelectedStudyTimeFeedback(attendanceID: string, status: "GREEN" | "YELLOW" | "RED", userID: string): Promise<functionResult> {
    const sessionUser = await getSessionUser(1);
    if (!sessionUser || sessionUser.permission === 0) {
        return { success: false, error: "Die Behörde verweigert dir das Recht zu speichern" };
    }
    const data = await db.attendances.update({
        where: { id: attendanceID },
        data: { feedback: status }
    });
    revalidatePath("/dashboard/events/attendedEvents");
    if (data) {
        logger.info(`Der Zustand der Studienzeit ${attendanceID} wurde auf ${status} gewandelt`, "saveSelectedStudyTimeFeedback");
        return { success: true };
    }
    logger.error(`Der Zustand der Studienzeit ${attendanceID} konnte nicht gewandelt werden — das System widersteht`, "saveSelectedStudyTimeFeedback");
    return { success: false, error: "Der Zustand der Studienzeit konnte nicht gewandelt werden — das System widersteht" };
}