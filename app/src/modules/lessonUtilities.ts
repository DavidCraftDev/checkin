"use server";

import dayjs from "dayjs";
import isoweek from "dayjs/plugin/isoWeek";
import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import db, { Events, User } from "./db";

dayjs.extend(isoweek);

export async function createLesson(lessonType: string): Promise<Events> {
    const sessionUser = await getSessionUser(1);
    const data = await db.events.create({
        data: {
            type: "Unterricht:" + lessonType,
            user: sessionUser.id,
            cw: dayjs().isoWeek()
        }
    });
    const user = await db.user.findMany({
        where: {
            courses: {
                has: lessonType
            },
            permission: 0
        }
    });
    Promise.all(user.map(async (user) => {
        await db.attendances.create({
            data: {
                eventID: data.id,
                userID: user.id,
                attended: false,
                type: "Unterricht",
                cw: dayjs().isoWeek()
            }
        });
    }));
    return data;
}

export async function setAttendanceStatus(eventID: string, userID: string, status: boolean): Promise<string | User> {
    const attendance = await db.attendances.findFirst({
        where: {
            AND: {
                eventID: eventID,
                userID: userID
            }
        }
    });
    if (attendance === null) return "Schüler gehört nicht zum Kurs";
    const data = await db.attendances.update({
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
                id: userID
            }
        });
        if (!user) return "Schüler nicht gefunden";
        return user;
    }
    return "Unbekannter Fehler";
}