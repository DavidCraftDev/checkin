"use server";

import dayjs from "dayjs";
import isoweek from "dayjs/plugin/isoWeek";
import { getSessionUser } from "./auth/cookieManager";
import db from "./db";
import { Event, User } from "@prisma/client";

dayjs.extend(isoweek);

export async function createLesson(lessonType: string): Promise<Event> {
    const sessionUser = await getSessionUser(1);
    const data = await db.event.create({
        data: {
            type: "Unterricht:" + lessonType,
            userId: sessionUser.id,
            cw: dayjs().isoWeek()
        }
    });
    const users = await db.user.findMany({
        where: {
            courses: {
                has: lessonType
            },
            permission: 0
        }
    });

    // Batch create attendances if possible, otherwise Promise.all is fine for creation here
    // But createMany is better
    if (users.length > 0) {
        await db.attendance.createMany({
            data: users.map(user => ({
                eventId: data.id,
                userId: user.id,
                attended: false,
                type: "Unterricht",
                cw: dayjs().isoWeek()
            }))
        });
    }

    return data;
}

export async function setAttendanceStatus(eventId: string, userId: string, status: boolean): Promise<string | User> {
    const attendance = await db.attendance.findFirst({
        where: {
            AND: {
                eventId: eventId,
                userId: userId
            }
        }
    });
    if (attendance === null) return "Schüler gehört nicht zum Kurs";
    const data = await db.attendance.update({
        where: {
            id: attendance.id
        },
        data: {
            attended: status
        }
    });
    if (data.attended === status) {
        const user = await db.user.findFirst({
            where: {
                id: userId
            }
        });
        if (!user) return "Schüler nicht gefunden";
        return user;
    }
    return "Unbekannter Fehler";
}
