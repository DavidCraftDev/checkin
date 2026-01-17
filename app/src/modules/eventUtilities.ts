import "server-only";

import { Attendance, Event, User } from "@prisma/client";
import db from "./db";
import { existUserPerID, getUserPerID } from "./userUtilities";
import { AttendancePerEventPerUser, AttendancePerUserPerEvent, CreatedEventPerUser } from "../interfaces/events";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { getSessionUser } from "./auth/cookieManager";
import { redirect } from "next/navigation";
import logger from "./logger";

dayjs.extend(isoWeek)
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)

export async function getAttendancesPerUser(userId: string, cw: number, year: number) {
    const dataAttendances = await db.attendance.findMany({
        where: {
            userId: userId,
            cw: cw,
            createdAt: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31")
            }
        },
        include: {
            event: true,
            user: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const data: AttendancePerUserPerEvent[] = [];

    // We need to fetch event owners. The `event` relation is already fetched, but we need the owner of that event.
    // Optimizing: extract event IDs and fetch their owners if needed, OR just include event.user?
    // Prisma allows nested include: include: { event: { include: { user: true } } }
    // Let's refactor the query above to be more efficient.

    // Re-query with better includes
    const richAttendances = await db.attendance.findMany({
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
                    user: true // The owner of the event
                }
            },
            user: true // The student (self)
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    for (const attendance of richAttendances) {
        if (attendance.eventId === "NOTE") {
             if ((((!attendance.type || !attendance.studentNote) && !attendance.teacherNote) && dayjs().diff(dayjs(attendance.createdAt), "minutes") > 1) || attendance.type === "Notiz:Löschen") {
                logger.info("Notiz mit der ID " + attendance.id + " von " + attendance.userId + " wurde gelöscht", "Event");
                await db.attendance.delete({ where: { id: attendance.id } });
                continue;
            }
            // For notes, we simulate an event
            const noteEvent: Event = {
                id: "NOTE",
                type: "Notiz",
                userId: userId,
                cw: cw,
                createdAt: dayjs().year(year).isoWeek(cw).toDate()
            };
            data.push({
                attendance: attendance,
                event: noteEvent,
                eventUser: attendance.user // Self is the owner of the note
            });
        } else if (attendance.event && attendance.event.user) {
            data.push({
                attendance: attendance,
                event: attendance.event,
                eventUser: attendance.event.user
            });
        }
    }

    return data;
}

export async function getAttendancesPerEvent(eventId: string) {
    const dataAttendance = await db.attendance.findMany({
        where: {
            eventId: eventId
        },
        include: {
            user: true
        },
        orderBy: {
            user: {
                displayname: 'asc'
            }
        }
    });

    const data: AttendancePerEventPerUser[] = dataAttendance.map(a => ({
        attendance: a,
        user: a.user
    }));

    return data;
}

export async function getAttendanceCountPerUser(userId: string, cw: number, year: number) {
    return await db.attendance.count({
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

export async function getEventPerID(eventId: string) {
    return await db.event.findUnique({
        where: {
            id: eventId
        },
        include: {
            user: true
        }
    });
}

export async function getCreatedEventsPerUser(userId: string, cw: number, year: number) {
    const dataEvents = await db.event.findMany({
        where: {
            userId: userId,
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
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const data: CreatedEventPerUser[] = [];

    for (const event of dataEvents) {
        const attendedUser = event._count.attendances;

        if (attendedUser === 0 && dayjs().diff(dayjs(event.createdAt), "hours") > 1) {
            await db.event.delete({ where: { id: event.id } });
            continue;
        }
        data.push({
            event: event,
            user: attendedUser
        });
    }
    return data;
}

export async function createEvent(type: string, userId: string) {
    return await db.event.create({
        data: {
            type: type,
            userId: userId,
            cw: dayjs().isoWeek()
        }
    });
}

export async function eventExists(eventId: string) {
    const count = await db.event.count({
        where: {
            id: eventId
        }
    });
    return count > 0;
}

export async function checkINHandler(eventId: string, userId: string) {
    // Legacy function, can be removed or kept for API compatibility if needed.
    // Re-implementing just in case.
    if (!await existUserPerID(userId)) return "Schüler nicht gefunden"
    if (await attendanceExists(eventId, userId)) return "Schüler bereits hinzugefügt";
    await db.attendance.create({
        data: {
            eventId: eventId,
            userId: userId,
            cw: dayjs().isoWeek(),
        }
    });
    return await getUserPerID(userId);
}

export async function createTeacherNote(id: string, note: string) {
    return await db.attendance.update({
        where: { id: id },
        data: { teacherNote: note }
    });
}

export async function createStudentNote(attendance: Attendance, note: string) {
    const user = await getSessionUser();
    if (user.id !== attendance.userId) {
        // Permission check
        const attendanceUser = await getUserPerID(attendance.userId);
        if (attendanceUser.group.filter(value => user.group.includes(value)).length === 0) redirect("/dashboard");
    }
    return await db.attendance.update({
        where: { id: attendance.id },
        data: { studentNote: note }
    });
}

export async function getAttendancesWithoutType(userId: string, cw: number, year: number) {
    const dataAttendances = await db.attendance.findMany({
        where: {
            userId: userId,
            cw: cw,
            createdAt: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31"),
            },
            type: null,
            NOT: {
                eventId: "NOTE"
            }
        },
        include: {
            event: {
                include: {
                    user: true
                }
            }
        }
    });

    const data: AttendancePerUserPerEvent[] = [];

    for (const attendance of dataAttendances) {
        if (attendance.event && attendance.event.user) {
            data.push({
                attendance: attendance,
                event: attendance.event,
                eventUser: attendance.event.user
            });
        }
    }
    return data;
}

export async function deleteEmptyEvent(eventId: string) {
    const count = await db.attendance.count({ where: { eventId: eventId } });
    if (count === 0) {
        await db.event.delete({ where: { id: eventId } });
        logger.info("Studienzeit mit der ID " + eventId + " wurde gelöscht", "Event");
        return true;
    }
    return false;
}

export async function getTeacherPerEvent(eventId: string): Promise<User | null> {
    const sessionUser = await getSessionUser();
    if (sessionUser.permission < 1) return null;

    const event = await db.event.findUnique({
        where: { id: eventId },
        include: { user: true }
    });
    return event?.user || null;
}

export type TeacherPerEvent = { [eventId: string]: User };

export async function getTeachersForEvents(eventIDs: string[]): Promise<TeacherPerEvent> {
    const sessionUser = await getSessionUser();
    if (sessionUser.permission < 1) return {} as TeacherPerEvent;

    const events = await db.event.findMany({
        where: { id: { in: eventIDs } },
        include: { user: true }
    });

    const data: TeacherPerEvent = {};
    for (const event of events) {
        data[event.id] = event.user;
    }
    return data;
}
