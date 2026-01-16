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
import { DATE_FORMATS, Permission, SPECIAL_EVENT_TYPES } from "../constants/permissions";

dayjs.extend(isoWeek)
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)

export async function getAttendancesPerUser(userID: string, cw: number, year: number) {
    const dataAttendances = await db.attendances.findMany({
        where: {
            userID: userID,
            cw: cw,
            created_at: {
                gte: new Date(DATE_FORMATS.ISO_DATE_START(year)),
                lte: new Date(DATE_FORMATS.ISO_DATE_END(year))
            }
        }
    });
    
    // Batch fetch all events at once
    const eventIDs = [...new Set(dataAttendances
        .filter(a => a.eventID !== SPECIAL_EVENT_TYPES.NOTE)
        .map(a => a.eventID))];
    
    const events = await db.events.findMany({
        where: { id: { in: eventIDs } }
    });
    const eventMap = new Map(events.map(e => [e.id, e]));
    
    // Batch fetch all event users
    const eventUserIDs = [...new Set(events.map(e => e.user))];
    const eventUsers = await db.user.findMany({
        where: { id: { in: eventUserIDs } }
    });
    const userMap = new Map(eventUsers.map(u => [u.id, u]));
    
    const data: AttendancePerUserPerEvent[] = [];
    const attendancesToDelete: string[] = [];
    
    for (const attendance of dataAttendances) {
        let dataEvent: Events;
        let dataUserEvent: User;
        
        if (attendance.eventID === SPECIAL_EVENT_TYPES.NOTE) {
            if ((((!attendance.type || !attendance.studentNote) && !attendance.teacherNote) && dayjs().diff(dayjs(attendance.created_at), "minutes") > 1) || attendance.type === SPECIAL_EVENT_TYPES.NOTE_DELETE) {
                logger.info(`Notiz mit der ID ${attendance.id} von ${attendance.userID} wurde gelöscht`, "Event");
                attendancesToDelete.push(attendance.id);
                continue;
            }
            dataEvent = {
                id: SPECIAL_EVENT_TYPES.NOTE,
                type: "Notiz",
                user: userID,
                cw: cw,
                created_at: dayjs().year(year).isoWeek(cw).toDate()
            } as Events;
            const noteUser = await getUserPerID(attendance.userID);
            dataUserEvent = noteUser;
        } else {
            const dataFromEvent = eventMap.get(attendance.eventID);
            if (!dataFromEvent) continue;
            dataEvent = dataFromEvent;
            const eventUser = userMap.get(dataEvent.user);
            if (!eventUser) continue;
            dataUserEvent = eventUser;
        }
        
        data.push({
            attendance: attendance,
            event: dataEvent,
            eventUser: dataUserEvent
        });
    }
    
    // Batch delete notes if needed
    if (attendancesToDelete.length > 0) {
        await db.attendances.deleteMany({
            where: { id: { in: attendancesToDelete } }
        });
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
    
    // Batch fetch all users at once instead of N+1 queries
    const userIDs = [...new Set(dataAttendance.map(a => a.userID))];
    const users = await db.user.findMany({
        where: {
            id: { in: userIDs }
        }
    });
    
    const userMap = new Map(users.map(u => [u.id, u]));
    
    const data: AttendancePerEventPerUser[] = dataAttendance
        .map((attendance) => {
            const user = userMap.get(attendance.userID);
            if (!user) return null;
            return {
                attendance: attendance,
                user: user
            };
        })
        .filter((item): item is AttendancePerEventPerUser => item !== null);
    
    data.sort((a, b) => a.user.displayname.localeCompare(b.user.displayname));
    return data;
}

export async function getAttendanceCountPerUser(userID: string, cw: number, year: number) {
    const data = await db.attendances.count({
        where: {
            userID: userID,
            cw: cw,
            created_at: {
                gte: new Date(DATE_FORMATS.ISO_DATE_START(year)),
                lte: new Date(DATE_FORMATS.ISO_DATE_END(year))
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
                gte: new Date(DATE_FORMATS.ISO_DATE_START(year)),
                lte: new Date(DATE_FORMATS.ISO_DATE_END(year))
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

export async function checkINHandler(eventID: string, userID: string) {
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
                gte: new Date(DATE_FORMATS.ISO_DATE_START(year)),
                lte: new Date(DATE_FORMATS.ISO_DATE_END(year)),
            },
            type: null,
            NOT: {
                eventID: SPECIAL_EVENT_TYPES.NOTE
            }
        }
    });
    
    // Batch fetch all events
    const eventIDs = dataAttendances.map(a => a.eventID);
    const events = await db.events.findMany({
        where: { id: { in: eventIDs } }
    });
    const eventMap = new Map(events.map(e => [e.id, e]));
    
    // Batch fetch all event users
    const eventUserIDs = [...new Set(events.map(e => e.user))];
    const eventUsers = await db.user.findMany({
        where: { id: { in: eventUserIDs } }
    });
    const userMap = new Map(eventUsers.map(u => [u.id, u]));
    
    const data: AttendancePerUserPerEvent[] = [];
    for (const attendance of dataAttendances) {
        const dataEvent = eventMap.get(attendance.eventID);
        if (!dataEvent) continue;
        
        const eventUser = userMap.get(dataEvent.user);
        if (!eventUser) continue;
        
        data.push({
            attendance: attendance,
            event: dataEvent,
            eventUser: eventUser
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
    const sessionUser = await getSessionUser(Permission.TEACHER);
    if (sessionUser.permission < Permission.TEACHER) return null;

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
    const sessionUser = await getSessionUser(Permission.TEACHER);
    if (sessionUser.permission < Permission.TEACHER) return {} as TeacherPerEvent;

    // Batch fetch all events
    const events = await db.events.findMany({
        where: {
            id: { in: eventIDs }
        },
        select: {
            id: true,
            user: true
        }
    });
    
    // Batch fetch all teachers
    const teacherIDs = [...new Set(events.map(e => e.user))];
    const teachers = await db.user.findMany({
        where: {
            id: { in: teacherIDs }
        }
    });
    const teacherMap = new Map(teachers.map(t => [t.id, t]));
    
    // Build result mapping
    const data: TeacherPerEvent = {};
    for (const event of events) {
        const teacher = teacherMap.get(event.user);
        if (teacher) {
            data[event.id] = teacher;
        }
    }

    return data;
}