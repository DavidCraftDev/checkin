"use server";

import dayjs from "dayjs";
import isoweek from "dayjs/plugin/isoWeek";
import { getSessionUser } from "./auth/cookieManager";
import db from "./db";
import { Events, User } from "@prisma/client";
import { Permission, SPECIAL_EVENT_TYPES } from "../constants/permissions";

dayjs.extend(isoweek);

export async function createLesson(lessonType: string): Promise<Events> {
    const sessionUser = await getSessionUser(Permission.TEACHER);
    const data = await db.events.create({
        data: {
            type: SPECIAL_EVENT_TYPES.LESSON_PREFIX + lessonType,
            user: sessionUser.id,
            cw: dayjs().isoWeek()
        }
    });
    const user = await db.user.findMany({
        where: {
            courses: {
                has: lessonType
            },
            permission: Permission.STUDENT
        }
    });
    await Promise.all(user.map(async (user) => {
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