"use server";

import { functionResult } from "@/app/src/interfaces/utilties";
import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import db from "@/app/src/modules/db";
import { attendanceExists, createTeacherNote, deleteEmptyEvent } from "@/app/src/modules/eventUtilities";
import logger from "@/app/src/modules/logger";
import { getUserPerUsername, searchUser, getUserPerID } from "@/app/src/modules/userUtilities";
import { Attendance, Event, User } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export async function handleEventDelete(eventID: string): Promise<void> {
    const data = await deleteEmptyEvent(eventID);
    revalidatePath("/dashboard/events/createdEvents");
    if (data) redirect("/dashboard/events/createdEvents");
}

export async function handleUserCheckIN(username: string, eventID: string): Promise<functionResult> {
    const sessionUser = await getSessionUser(1);
    if (!sessionUser) return { success: false, error: "Nicht eingeloggt" };

    // Verify event ownership
    const event = await db.event.findUnique({ where: { id: eventID } });
    if (!event || event.userId !== sessionUser.id) return { success: false, error: "Nicht autorisiert" };

    const user = await getUserPerUsername(username);
    if (!user) return { success: false, error: "Schüler nicht gefunden" };

    if (await attendanceExists(eventID, user.id)) {
        return { success: false, error: "Schüler bereits hinzugefügt" };
    }

    try {
        await db.attendance.create({
            data: {
                eventId: eventID,
                userId: user.id,
                cw: dayjs().isoWeek(),
            }
        });
        return { success: true, data: user };
    } catch (e) {
        logger.error("Error creating attendance: " + e, "handleUserCheckIN");
        return { success: false, error: "Fehler beim Speichern" };
    }
}

export async function searchUserHandler(search: string): Promise<User[]> {
    return await searchUser(search);
}

export async function removeUserHandler(attendanceID: string, eventID: string): Promise<functionResult> {
    const sessionUser = await getSessionUser(1);
    if (!sessionUser) return { success: false, error: "Nicht eingeloggt" };

    const event = await db.event.findUnique({ where: { id: eventID } });
    if (!event || event.userId !== sessionUser.id) return { success: false, error: "Nicht autorisiert" };

    const attendance = await db.attendance.findUnique({ where: { id: attendanceID } });
    if (!attendance || attendance.eventId !== eventID) return { success: false, error: "Eintrag nicht gefunden" };

    const student = await getUserPerID(attendance.userId);
    const studentName = student && student.displayname ? student.displayname : "Unbekannt";

    await db.attendance.delete({
        where: { id: attendanceID }
    });

    logger.info(sessionUser.displayname + " hat " + studentName + " aus der Studienzeit mit der ID " + eventID + " entfernt", "Event");
    return { success: true };
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
