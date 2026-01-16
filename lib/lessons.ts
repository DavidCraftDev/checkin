"use server";

import dayjs from "dayjs";
import isoweek from "dayjs/plugin/isoWeek";
import { getSessionUser } from "@/lib/auth/cookieManager";
import db from "@/lib/db";
import { Event, User } from "@prisma/client";

dayjs.extend(isoweek);

export async function createLesson(lessonType: string): Promise<Event> {
    const sessionUser = await getSessionUser(1);

    const event = await db.event.create({
        data: {
            type: "Unterricht:" + lessonType,
            creatorId: sessionUser.id,
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

    if (users.length > 0) {
        await db.attendance.createMany({
            data: users.map(user => ({
                eventId: event.id,
                userId: user.id,
                attended: false,
                type: "Unterricht",
                cw: dayjs().isoWeek()
            }))
        });
    }

    return event;
}

export async function setAttendanceStatus(eventId: string, userId: string, status: boolean): Promise<string | User> {
    const attendance = await db.attendance.findFirst({
        where: {
            eventId: eventId,
            userId: userId
        }
    });

    if (!attendance) return "Schüler gehört nicht zum Kurs";

    const updated = await db.attendance.update({
        where: {
            id: attendance.id
        },
        data: {
            attended: status
        },
        include: {
            user: true
        }
    });

    return updated.user;
}
