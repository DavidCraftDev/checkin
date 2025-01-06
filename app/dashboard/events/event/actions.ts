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
    return { success: true, data: data };
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