import "server-only";

import { Events, User } from "@prisma/client";
import db from "./db";
import { existUserPerID, getUserPerID } from "./userUtilities";
import { AttendancePerEventPerUser, AttendancePerUserPerEvent, CreatedEventPerUser } from "../interfaces/events";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";

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
    const data: AttendancePerUserPerEvent[] = new Array();
    await Promise.all(dataAttendances.map(async (attendance) => {
        let dataEvent: Events;
        let dataUserEvent: User;
        if (attendance.eventID === "NOTE") {
            if (((!attendance.type || !attendance.studentNote) && dayjs().diff(dayjs(attendance.created_at), "minutes") > 1) || attendance.type === "Notiz:Löschen") {
                await db.attendances.delete({
                    where: {
                        id: attendance.id
                    }
                });
                return;
            }
            dataEvent = {
                id: "NOTE",
                type: "Notiz",
                user: userID,
                cw: cw,
                created_at: dayjs().year(year).isoWeek(cw).toDate()
            } as Events;
            dataUserEvent = await getUserPerID(attendance.userID);
        } else {
            const dataFromEvent = await getEventPerID(attendance.eventID);
            if (!dataFromEvent) return;
            dataEvent = dataFromEvent;
            dataUserEvent = await getUserPerID(dataEvent.user);
        }
        data.push({
            attendance: attendance,
            event: dataEvent,
            eventUser: dataUserEvent
        });
    }));
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
    const data: AttendancePerEventPerUser[] = new Array();
    await Promise.all(dataAttendance.map(async (attendance) => {
        const dataUser = await getUserPerID(attendance.userID);
        data.push({
            attendance: attendance,
            user: dataUser
        });
    }));
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
    const data: CreatedEventPerUser[] = new Array();
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
    if (!await existUserPerID(userID)) return "ErrorNotFound"
    if (await attendanceExists(eventID, userID)) return "ErrorAlreadyCheckedIn"
    await db.attendances.create({
        data: {
            eventID: eventID,
            userID: userID,
            cw: dayjs().isoWeek(),
        }
    });
    let userData: User = await getUserPerID(userID);
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

export async function createStudentNote(id: string, note: string) {
    const data = await db.attendances.update({
        where: {
            id: id
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
    const data: AttendancePerUserPerEvent[] = new Array();
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
        return true;
    }
    return false;
}