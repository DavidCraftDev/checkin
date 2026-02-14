/** @file Provides Provides helper functions to get and mutate data related to events */

import "server-only";

import db, { Attendances, Events, User } from "./db";
import { existUserPerID, getUserPerID } from "./userUtilities";
import { AttendancePerEventPerUser, AttendancePerUserPerEvent, CreatedEventPerUser } from "@/app/src/interfaces/events";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { getSessionUser } from "@/app/src/modules/auth/cookieManager";
import { redirect } from "next/navigation";
import logger from "./logger";

dayjs.extend(isoWeek)
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)

export async function getAttendancesPerUser(userID: string, cw: number, year: number) {
    // Fetch all attendances of the user in the given week and year
    const userAttendances = await db.attendances.findMany({
        where: {
            userID: userID,
            cw: cw,
            created_at: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31")
            }
        }
    });

    // Get all users which have an attendance in this week to avoid multiple queries in the loop
    const userSet: Set<string> = new Set();
    userAttendances.forEach(attendance => {
        userSet.add(attendance.userID);
    });
    userSet.add(userID);
    const users = await db.user.findMany({
        where: {
            id: { in: Array.from(userSet) }
        }
    });
    const usersMap = new Map(users.map(user => [user.id, user]));

    const data: AttendancePerUserPerEvent[] = [];
    for (const attendance of userAttendances) {
        let dataEvent: Events;
        let dataUserEvent: User;
        if (attendance.eventID === "NOTE") {
            // Delete notes which are older than 1 minute and have no type or note or have the type "Notiz:Löschen"
            if ((((!attendance.type || !attendance.studentNote) && !attendance.teacherNote) && dayjs().diff(dayjs(attendance.created_at), "minutes") > 1) || attendance.type === "Notiz:Löschen") {
                logger.info("Notiz mit der ID " + attendance.id + " von " + attendance.userID + " wurde gelöscht", "Event");
                await db.attendances.delete({
                    where: {
                        id: attendance.id
                    }
                });
                continue;
            }
            // Create a fake event for the note to display it in the UI
            dataEvent = {
                id: "NOTE",
                type: "Notiz",
                user: userID,
                cw: cw,
                created_at: dayjs().year(year).isoWeek(cw).toDate()
            } as Events;
            dataUserEvent = usersMap.get(attendance.userID)!;
        } else {
            const dataFromEvent = await getEventPerID(attendance.eventID);
            if (!dataFromEvent) continue;
            dataEvent = dataFromEvent;
            dataUserEvent = usersMap.get(dataFromEvent.user)!;
        }
        data.push({
            attendance: attendance,
            event: dataEvent,
            eventUser: dataUserEvent
        });
    };
    // Sort attendances by created_at date
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

    // Get all users which have an attendance in this week to avoid multiple queries in the loop
    const userSet: Set<string> = new Set();
    dataAttendance.forEach(attendance => {
        userSet.add(attendance.userID);
    });
    const users = await db.user.findMany({
        where: {
            id: { in: Array.from(userSet) }
        }
    });
    const usersMap = new Map(users.map(user => [user.id, user]));

    const data: AttendancePerEventPerUser[] = [];
    for (const attendance of dataAttendance) {
        const dataUser = usersMap.get(attendance.userID)!;
        data.push({
            attendance: attendance,
            user: dataUser
        });
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
    const data: CreatedEventPerUser[] = [];
    await Promise.all(dataEvents.map(async (event) => {
        const attendedUser = await db.attendances.count({
            where: {
                eventID: event.id
            }
        });
        if (attendedUser === 0 && dayjs().diff(dayjs(event.created_at), "hours") > 1) {
            await db.events.delete({
                where: {
                    id: event.id
                }
            });
            return;
        }
        data.push({
            event: event,
            user: attendedUser
        });
    }));
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

export async function checkINUser(eventID: string, userID: string) {
    if (!await existUserPerID(userID)) return "Schüler nicht gefunden"
    if (await attendanceExists(eventID, userID)) return "Schüler bereits hinzugefügt";
    await db.attendances.create({
        data: {
            eventID: eventID,
            userID: userID,
            cw: dayjs().isoWeek(),
        }
    });
    const userData: User = await getUserPerID(userID);
    return userData;
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
    const data: AttendancePerUserPerEvent[] = [];
    await Promise.all(dataAttendances.map(async (attendance) => {
        const dataEvent = await getEventPerID(attendance.eventID);
        if (!dataEvent) return;
        data.push({
            attendance: attendance,
            event: dataEvent,
            eventUser: await getUserPerID(dataEvent.user)
        });
    }));
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
    await Promise.all(eventIDs.map(async (eventID) => {
        const teacher = await getTeacherPerEvent(eventID);
        if (teacher) data[eventID] = teacher;
    }));

    return data;
}