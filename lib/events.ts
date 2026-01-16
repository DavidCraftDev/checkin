import "server-only";
import { Attendance, Event, User } from "@prisma/client";
import db from "@/lib/db";
import { getUserById, userExists } from "@/lib/users";
import { AttendancePerEventPerUser, AttendancePerUserPerEvent, CreatedEventPerUser } from "@/types/events";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { getSessionUser } from "@/lib/auth/cookieManager";
import { redirect } from "next/navigation";
import logger from "@/lib/logger";

dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

export async function getAttendancesPerUser(userId: string, cw: number, year: number) {
    const attendances = await db.attendance.findMany({
        where: {
            userId: userId,
            cw: cw,
            createdAt: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31")
            }
        },
        include: {
            event: {
                include: {
                    creator: true
                }
            }
        }
    });

    const data: AttendancePerUserPerEvent[] = [];

    for (const attendance of attendances) {
        if (!attendance.eventId || attendance.eventId === "NOTE") {
             if (attendance.type === "Notiz:Löschen" ||
                ((!attendance.type || !attendance.studentNote) && !attendance.teacherNote && dayjs().diff(dayjs(attendance.createdAt), "minutes") > 1)) {

                logger.info("Notiz mit der ID " + attendance.id + " von " + attendance.userId + " wurde gelöscht", "Event");
                await db.attendance.delete({ where: { id: attendance.id } });
                continue;
            }

            const dataEvent: Event = {
                id: "NOTE",
                type: "Notiz",
                creatorId: userId,
                cw: cw,
                createdAt: dayjs().year(year).isoWeek(cw).toDate()
            } as Event;

            const eventUser = await getUserById(userId);
            if (eventUser) {
                data.push({
                    attendance,
                    event: dataEvent,
                    eventUser
                });
            }
        } else if (attendance.event && attendance.event.creator) {
            data.push({
                attendance,
                event: attendance.event,
                eventUser: attendance.event.creator
            });
        }
    }

    data.sort((a, b) => {
        if (a.attendance.createdAt > b.attendance.createdAt) return -1;
        if (a.attendance.createdAt < b.attendance.createdAt) return 1;
        return 0;
    });
    return data;
}

export async function getAttendancesPerEvent(eventId: string) {
    const attendances = await db.attendance.findMany({
        where: { eventId: eventId },
        include: { user: true }
    });

    const data: AttendancePerEventPerUser[] = attendances.map(attendance => ({
        attendance,
        user: attendance.user
    }));

    data.sort((a, b) => a.user.displayName.localeCompare(b.user.displayName));
    return data;
}

export async function getAttendanceCountPerUser(userId: string, cw: number, year: number) {
    return db.attendance.count({
        where: {
            userId: userId,
            cw: cw,
            createdAt: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31")
            }
        }
    });
}

export async function attendanceExists(eventId: string, userId: string) {
    const count = await db.attendance.count({
        where: {
            eventId: eventId,
            userId: userId
        }
    });
    return count > 0;
}

export async function getEventById(eventId: string) {
    return db.event.findUnique({
        where: { id: eventId }
    });
}
export const getEventPerID = getEventById;

export async function getCreatedEventsPerUser(userId: string, cw: number, year: number) {
    const events = await db.event.findMany({
        where: {
            creatorId: userId,
            cw: cw,
            createdAt: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31")
            }
        },
        include: {
            _count: {
                select: { attendances: true }
            }
        }
    });

    const data: CreatedEventPerUser[] = [];

    for (const event of events) {
        const attendedUserCount = event._count.attendances;

        if (attendedUserCount === 0 && dayjs().diff(dayjs(event.createdAt), "hours") > 1) {
            await db.event.delete({ where: { id: event.id } });
            continue;
        }
        data.push({
            event,
            user: attendedUserCount
        });
    }

    data.sort((a, b) => {
        if (a.event.createdAt > b.event.createdAt) return -1;
        if (a.event.createdAt < b.event.createdAt) return 1;
        return 0;
    });
    return data;
}

export async function createEvent(type: string, userId: string) {
    return db.event.create({
        data: {
            type: type,
            creatorId: userId,
            cw: dayjs().isoWeek()
        }
    });
}

export async function eventExists(eventId: string) {
    const count = await db.event.count({
        where: { id: eventId }
    });
    return count > 0;
}

export async function checkINHandler(eventId: string, userId: string) {
    if (!await userExists(userId)) return "Schüler nicht gefunden";
    if (await attendanceExists(eventId, userId)) return "Schüler bereits hinzugefügt";

    await db.attendance.create({
        data: {
            eventId: eventId,
            userId: userId,
            cw: dayjs().isoWeek(),
        }
    });

    return getUserById(userId);
}

export async function createTeacherNote(id: string, note: string) {
    return db.attendance.update({
        where: { id: id },
        data: { teacherNote: note }
    });
}

export async function createStudentNote(attendance: Attendance, note: string) {
    const user = await getSessionUser();

    if (user.id !== attendance.userId) {
        const attendanceUser = await getUserById(attendance.userId);
        if (!attendanceUser) redirect("/dashboard");
        const commonGroups = attendanceUser.groups.filter(value => user.groups.includes(value));
        if (commonGroups.length === 0) redirect("/dashboard");
    }

    return db.attendance.update({
        where: { id: attendance.id },
        data: { studentNote: note }
    });
}

export async function getAttendancesWithoutType(userId: string, cw: number, year: number) {
    const attendances = await db.attendance.findMany({
        where: {
            userId: userId,
            cw: cw,
            createdAt: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31"),
            },
            type: null,
            eventId: { not: null }
        },
        include: {
            event: {
                include: { creator: true }
            }
        }
    });

    const data: AttendancePerUserPerEvent[] = [];

    for (const attendance of attendances) {
        if (attendance.event && attendance.event.creator) {
            data.push({
                attendance,
                event: attendance.event,
                eventUser: attendance.event.creator
            });
        }
    }
    return data;
}

export async function deleteEmptyEvent(eventId: string) {
    const count = await db.attendance.count({ where: { eventId } });
    if (count === 0) {
        await db.event.delete({ where: { id: eventId } });
        logger.info("Studienzeit mit der ID " + eventId + " wurde gelöscht", "Event");
        return true;
    }
    return false;
}

export type TeacherPerEvent = { [eventId: string]: User };

export async function getTeachersForEvents(eventIDs: string[]): Promise<TeacherPerEvent> {
    const sessionUser = await getSessionUser();
    if (sessionUser.permission < 1) return {} as TeacherPerEvent;

    const events = await db.event.findMany({
        where: { id: { in: eventIDs } },
        include: { creator: true }
    });

    const data: TeacherPerEvent = {};
    for (const event of events) {
        data[event.id] = event.creator;
    }

    return data;
}

export const getTeacherPerEvent = async (id: string) => {
    const event = await db.event.findUnique({where: {id}, include: {creator: true}});
    return event?.creator || null;
}
