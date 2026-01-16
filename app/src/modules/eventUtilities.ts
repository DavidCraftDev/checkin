import "server-only";

import { Attendances, Events, User } from "@prisma/client";
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

export async function getAttendancesPerUser(userID: string, cw: number, year: number) {
    const dataAttendances = await db.attendances.findMany({
        where: {
            userID: userID,
            cw: cw,
            created_at: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31")
            }
        }
    });

    const eventIDs = dataAttendances
        .filter(a => a.eventID !== "NOTE")
        .map(a => a.eventID);

    const events = await db.events.findMany({
        where: { id: { in: eventIDs } }
    });
    const eventsMap = new Map(events.map(e => [e.id, e]));

    const eventOwnerIDs = events.map(e => e.user);
    const allUserIDsToFetch = Array.from(new Set([...eventOwnerIDs, userID]));

    const users = await db.user.findMany({
        where: { id: { in: allUserIDsToFetch } }
    });
    const usersMap = new Map(users.map(u => [u.id, u]));

    const data: AttendancePerUserPerEvent[] = [];

    for (const attendance of dataAttendances) {
        let dataEvent: Events;
        let dataUserEvent: User | undefined;

        if (attendance.eventID === "NOTE") {
            if ((((!attendance.type || !attendance.studentNote) && !attendance.teacherNote) && dayjs().diff(dayjs(attendance.created_at), "minutes") > 1) || attendance.type === "Notiz:Löschen") {
                logger.info("Notiz mit der ID " + attendance.id + " von " + attendance.userID + " wurde gelöscht", "Event");
                await db.attendances.delete({
                    where: {
                        id: attendance.id
                    }
                });
                continue;
            }
            dataEvent = {
                id: "NOTE",
                type: "Notiz",
                user: userID,
                cw: cw,
                created_at: dayjs().year(year).isoWeek(cw).toDate()
            } as Events;
            dataUserEvent = usersMap.get(userID);
        } else {
            const fetchedEvent = eventsMap.get(attendance.eventID);
            if (!fetchedEvent) continue;
            dataEvent = fetchedEvent;
            dataUserEvent = usersMap.get(dataEvent.user);
        }

        if (dataUserEvent) {
            data.push({
                attendance: attendance,
                event: dataEvent,
                eventUser: dataUserEvent
            });
        }
    }

    data.sort((a, b) => {
        if (a.attendance.created_at > b.attendance.created_at) return -1;
        if (a.attendance.created_at < b.attendance.created_at) return 1;
        return 0;
    });
    return data;
}

export async function getAttendancesPerEvent(eventID: string) {
    const dataAttendance = await db.attendances.findMany({
        where: {
            eventID: eventID
        }
    });

    const userIDs = dataAttendance.map(a => a.userID);
    const users = await db.user.findMany({
        where: { id: { in: userIDs } }
    });
    const usersMap = new Map(users.map(u => [u.id, u]));

    const data: AttendancePerEventPerUser[] = [];
    for (const attendance of dataAttendance) {
        const user = usersMap.get(attendance.userID);
        if (user) {
            data.push({
                attendance: attendance,
                user: user
            });
        }
    }
    data.sort((a, b) => a.user.displayname.localeCompare(b.user.displayname));
    return data;
}

export async function getAttendanceCountPerUser(userID: string, cw: number, year: number) {
    const data = await db.attendances.count({
        where: {
            userID: userID,
            cw: cw,
            created_at: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31")
            }
        }
    });
    return data;
}

export async function attendanceExists(eventID: string, userID: string) {
    const data = await db.attendances.count({
        where: {
            eventID: eventID,
            userID: userID
        }
    });
    return data > 0;
}

export async function getEventPerID(eventID: string) {
    const data = await db.events.findUnique({
        where: {
            id: eventID
        }
    });
    return data;
}

export async function getCreatedEventsPerUser(userID: string, cw: number, year: number) {
    const dataEvents = await db.events.findMany({
        where: {
            user: userID,
            cw: cw,
            created_at: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31")
            }
        }
    });

    const eventIDs = dataEvents.map(e => e.id);
    const attendanceCounts = await db.attendances.groupBy({
        by: ['eventID'],
        where: {
            eventID: { in: eventIDs }
        },
        _count: {
            userID: true
        }
    });

    const countMap = new Map(attendanceCounts.map(ac => [ac.eventID, ac._count.userID]));

    const data: CreatedEventPerUser[] = [];

    for (const event of dataEvents) {
        const attendedUser = countMap.get(event.id) || 0;

        if (attendedUser === 0 && dayjs().diff(dayjs(event.created_at), "hours") > 1) {
            await db.events.delete({
                where: {
                    id: event.id
                }
            });
            continue;
        }
        data.push({
            event: event,
            user: attendedUser
        });
    }

    data.sort((a, b) => {
        if (a.event.created_at > b.event.created_at) return -1;
        if (a.event.created_at < b.event.created_at) return 1;
        return 0;
    });
    return data;
}

export async function createEvent(type: string, userID: string) {
    const data = await db.events.create({
        data: {
            type: type,
            user: userID,
            cw: dayjs().isoWeek()
        }
    });
    return data;
}

export async function eventExists(eventID: string) {
    const data = await db.events.count({
        where: {
            id: eventID
        }
    });
    return data > 0;
}

export async function createTeacherNote(id: string, note: string) {
    const data = await db.attendances.update({
        where: {
            id: id
        },
        data: {
            teacherNote: note
        }
    });
    return data;
}

export async function createStudentNote(attendance: Attendances, note: string) {
    const user = await getSessionUser();
    if (user.id !== attendance.userID) {
        const attendanceUser = await getUserPerID(attendance.userID);
        if (attendanceUser.group.filter(value => user.group.includes(value)).length === 0) redirect("/dashboard");
    }
    const data = await db.attendances.update({
        where: {
            id: attendance.id
        },
        data: {
            studentNote: note
        }
    });
    return data;
}

export async function getAttendancesWithoutType(userID: string, cw: number, year: number) {
    const dataAttendances = await db.attendances.findMany({
        where: {
            userID: userID,
            cw: cw,
            created_at: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31"),
            },
            type: null,
            NOT: {
                eventID: "NOTE"
            }
        }
    });

    const eventIDs = dataAttendances.map(a => a.eventID);
    const events = await db.events.findMany({
        where: { id: { in: eventIDs } }
    });
    const eventsMap = new Map(events.map(e => [e.id, e]));

    const ownerIDs = events.map(e => e.user);
    const owners = await db.user.findMany({
        where: { id: { in: ownerIDs } }
    });
    const ownersMap = new Map(owners.map(u => [u.id, u]));

    const data: AttendancePerUserPerEvent[] = [];

    for (const attendance of dataAttendances) {
        const dataEvent = eventsMap.get(attendance.eventID);
        if (!dataEvent) continue;
        const owner = ownersMap.get(dataEvent.user);
        if (!owner) continue;

        data.push({
            attendance: attendance,
            event: dataEvent,
            eventUser: owner
        });
    }
    return data;
}

export async function deleteEmptyEvent(eventID: string) {
    const data = await getAttendancesPerEvent(eventID);
    if (data.length === 0) {
        await db.events.delete({
            where: {
                id: eventID
            }
        });
        logger.info("Studienzeit mit der ID " + eventID + " wurde gelöscht", "Event");
        return true;
    }
    return false;
}

export async function getTeacherPerEvent(eventID: string): Promise<User | null> {
    // Check if the user is allowed to get this data
    const sessionUser = await getSessionUser();
    if (sessionUser.permission < 1) return null;

    // Get the event data
    const data = await db.events.findUnique({
        where: {
            id: eventID
        },
        select: {
            user: true
        }
    });
    if (!data) return null;

    // Get the data of the teacher
    const teacher = await getUserPerID(data.user);

    return teacher;
}

export type TeacherPerEvent = { [eventID: string]: User };

export async function getTeachersForEvents(eventIDs: string[]): Promise<TeacherPerEvent> {
    // Check if the user is allowed to get this data
    const sessionUser = await getSessionUser();
    if (sessionUser.permission < 1) return {} as TeacherPerEvent;

    // Initialize object to store teacher data and get teacher data for each event
    const data: TeacherPerEvent = {};

    // Optimize: fetch all teachers at once
    // First get all events to get teacher IDs
    const events = await db.events.findMany({
        where: { id: { in: eventIDs } },
        select: { id: true, user: true }
    });

    const teacherIDs = Array.from(new Set(events.map(e => e.user)));
    const teachers = await db.user.findMany({
        where: { id: { in: teacherIDs } }
    });
    const teachersMap = new Map(teachers.map(t => [t.id, t]));

    for (const event of events) {
        const teacher = teachersMap.get(event.user);
        if (teacher) {
            data[event.id] = teacher;
        }
    }

    return data;
}
