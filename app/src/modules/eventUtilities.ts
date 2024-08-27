import "server-only";

import { Events, User } from "@prisma/client";
import db from "./db";
import { existUserPerID, getUserPerID } from "./userUtilities";
import moment from "moment";
import { AttendancePerEventPerUser, AttendancePerUserPerEvent, CreatedEventPerUser } from "../interfaces/events";

export async function getAttendancesPerUser(userID: string, cw: number, year: number) {
    const dataAttendances = await db.attendance.findMany({
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
        let dataEvent: Events | null;
        let dataUserEvent: User;
        if (attendance.eventID === "NOTE") {
            if (((!attendance.type || !attendance.studentNote) && moment().diff(moment(attendance.created_at), "minutes") > 1) || attendance.type === "note:delete") {
                await db.attendance.delete({
                    where: {
                        id: attendance.id
                    }
                });
                return;
            }
            dataEvent = {
                id: "NOTE",
                name: "Notiz",
                user: userID,
                cw: cw,
                studyTime: true,
                created_at: moment().year(year).week(cw).toDate()
            } as Events;
            dataUserEvent = await getUserPerID(attendance.userID);
        } else {
            dataEvent = await getEventPerID(attendance.eventID);
            if (!dataEvent) return;
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
    const dataAttendance = await db.attendance.findMany({
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
    const data = await db.attendance.count({
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
    const data = await db.attendance.count({
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
        const attendedUser = await db.attendance.count({
            where: {
                eventID: event.id
            }
        });
        if (attendedUser === 0 && moment().diff(moment(event.created_at), "hours") > 1) {
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

export async function createEvent(name: string, userID: string, studyTime: boolean) {
    const data = await db.events.create({
        data: {
            name: name,
            user: userID,
            cw: moment().isoWeek(),
            studyTime: studyTime
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
    await db.attendance.create({
        data: {
            eventID: eventID,
            userID: userID,
            cw: moment().isoWeek(),
        }
    });
    let userData: User = await getUserPerID(userID);
    return userData;
}

export async function createTeacherNote(id: string, note: string) {
    const data = await db.attendance.update({
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
    const data = await db.attendance.update({
        where: {
            id: id
        },
        data: {
            studentNote: note
        }
    });
    return data;
}

export async function getStudyTimes(userID: string, cw: number, year: number) {
    const data = await db.attendance.findMany({
        where: {
            userID: userID,
            cw: cw,
            created_at: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31")
            },
            type: { not: null }
        }
    });
    return data;
}

export async function getNormalEventsAttendances(userID: string, cw: number, year: number) {
    const dataAttendances = await db.attendance.findMany({
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
    const data: Events[] = new Array();
    await Promise.all(dataAttendances.map(async (attendance) => {
        const dataEvent = await getEventPerID(attendance.eventID);
        if (!dataEvent) return;
        data.push(dataEvent);
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