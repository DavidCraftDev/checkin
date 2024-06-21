import db from "./db";
import { existUserPerID, getUserPerID } from "./userUtilities";
import moment from "moment";

export async function getAttendancesPerUser(userID: string, cw: number, year: number) {
    const dataAttendance = await db.attendance.findMany({
        where: {
            userID: userID,
            cw: Number(cw),
            created_at: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31")
            }
        }
    });
    const data = new Array();
    for (let i = 0; i < dataAttendance.length; i++) {
        let dataEvent;
        let dataUserEvent;
        if (dataAttendance[i].eventID === "NOTE") {
            dataEvent = {
                id: "NOTE",
                name: "Notiz",
                user: userID,
                cw: cw,
                studyTime: true
            };
            dataUserEvent = await getUserPerID(dataAttendance[i].userID);
        } else {
            dataEvent = await getEventPerID(dataAttendance[i].eventID);
            dataUserEvent = await getUserPerID(dataEvent.user);
        }
        dataUserEvent.password = undefined
        dataUserEvent.loginVersion = undefined
        data.push({
            attendance: dataAttendance[i],
            event: dataEvent,
            eventUser: dataUserEvent
        });
    }
    if (!data) return [] as any;
    return data;
}

export async function getAttendancesPerEvent(eventID: string) {
    const dataAttendance = await db.attendance.findMany({
        where: {
            eventID: eventID
        }
    });
    const data = new Array();
    for (let i = 0; i < dataAttendance.length; i++) {
        const dataUser = await getUserPerID(dataAttendance[i].userID);
        data.push({
            attendance: dataAttendance[i],
            user: dataUser
        });
    }
    if (!data) return [] as any;
    return data;
}

export async function getAttendanceCountPerUser(userID: string, cw: number, year: number) {
    const data = await db.attendance.count({
        where: {
            userID: userID,
            cw: Number(cw),
            created_at: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31")
            }
        }
    });
    if (!data) return 0 as number;
    return data;
}

export async function attendanceExists(eventID: string, userID: string) {
    const data = await db.attendance.count({
        where: {
            eventID: eventID,
            userID: userID
        }
    });
    if (!data) return 0 as number;
    return data;
}

export async function getEventsPerUser(userID: string) {
    const data = await db.events.findMany({
        where: {
            user: userID
        }
    });
    if (!data) return [] as any;
    return data;
}

export async function getEventPerID(eventID: string) {
    const data = await db.events.findUnique({
        where: {
            id: eventID
        }
    });
    if (!data) return {} as any;
    return data;
}

export async function getCreatedEventsPerUser(userID: string, cw: number, year: number) {
    const dataEvents = await db.events.findMany({
        where: {
            user: userID,
            cw: Number(cw),
            created_at: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31")
            }
        }
    });
    const data = new Array();
    for (let i = 0; i < dataEvents.length; i++) {
        const attendedUser = await db.attendance.count({
            where: {
                eventID: dataEvents[i].id
            }
        });
        data.push({
            event: dataEvents[i],
            user: attendedUser
        });
    }
    if (!data) return [] as any;
    return data;
}

export async function createEvent(name: string, userID: string, studyTime: boolean) {
    const cw = moment().week();
    const data = await db.events.create({
        data: {
            name: name,
            user: userID,
            cw: cw,
            studyTime: studyTime
        }
    });
    if (!data) return {} as any;
    return data;
}

export async function eventExists(eventID: string) {
    const data = await db.events.count({
        where: {
            id: eventID
        }
    });
    if (!data) return 0 as number;
    return data;
}

export async function checkINHandler(eventID: string, userID: string) {
    if (await existUserPerID(userID) === 0) return "ErrorNotFound"
    if (await attendanceExists(eventID, userID) > 0) return "ErrorAlreadyCheckedIn"
    if (await eventExists(eventID) === 0) return "ErrorEventNotFound"
    let data = await db.attendance.create({
        data: {
            eventID: eventID,
            userID: userID,
            cw: moment().week(),
        }
    });
    let userData = await getUserPerID(userID);
    userData.password = undefined
    userData.loginVersion = undefined
    return userData;
}

export async function createTeacherNote(id: string, note: string) {
    const data: any = await db.attendance.update({
        where: {
            id: id
        },
        data: {
            teacherNote: note
        }
    });
    if (!data) return {} as any;
    return data;
}

export async function createStudentNote(id: string, note: string) {
    const data: any = await db.attendance.update({
        where: {
            id: id
        },
        data: {
            studentNote: note
        }
    });
    if (!data) return {} as any;
    return data;
}

export async function getStudyTimes(userID: string, cw: number, year: number) {
    const data = await db.attendance.findMany({
        where: {
            userID: userID,
            cw: Number(cw),
            created_at: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31")
            },
            type: { not: null }
        }
    });
    if (!data) return [] as any;
    return data;
}

export async function getNormalEventsAttendances(userID: string, cw: number, year: number) {
    const dataAttendances = await db.attendance.findMany({
        where: {
            userID: userID,
            cw: Number(cw),
            created_at: {
                gte: new Date(String(year) + "-01-01"),
                lte: new Date(String(year) + "-12-31"),
            },
            type: null
        }
    });
    // Get Event Data from dataAttendances
    const data = new Array();
    for (let i = 0; i < dataAttendances.length; i++) {
        const dataEvent = await getEventPerID(dataAttendances[i].eventID);
        data.push(dataEvent);
    }
    return data;
}