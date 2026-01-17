"use server";

import { functionResult } from "@/app/src/interfaces/utilties";
import db from "@/app/src/modules/db";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export async function handleCreateStudyTimeNote(userID: string, cw: number, year: number): Promise<functionResult> {
    try {
        await db.attendance.create({
            data: {
                userId: userID,
                eventId: "NOTE",
                cw: cw,
                createdAt: dayjs().year(year).isoWeek(cw).toDate()
            }
        });
        return { success: true };
    } catch (e) {
        return { success: false, error: "Fehler beim Erstellen der Notiz" };
    }
}
