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
        const dataEvent = await getEventPerID(dataAttendance[i].eventID);
        const dataUserEvent = await getUserPerID(dataEvent.user);
        data.push({
            attendance: dataAttendance[i],
            event: dataEvent,
            eventUser: dataUserEvent
        });
    }
    if(!data) return [] as any;
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
    if(!data) return [] as any;
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
    if(!data) return 0 as number;
    return data;
}

export async function attendanceExists(eventID: string, userID: string) {
    const data = await db.attendance.count({
        where: {
            eventID: eventID,
            userID: userID
        }
    });
    if(!data) return 0 as number;
    return data;
}

export async function getEventsPerUser(userID: string) {
    const data = await db.events.findMany({
        where: {
            user: userID
        }
    });
    if(!data) return [] as any;
    return data;
}

export async function getEventPerID(eventID: string) {
    const data = await db.events.findUnique({
        where: {
            id: eventID
        }
    });
    if(!data) return {} as any;
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
    if(!data) return [] as any;
    return data;
}

export async function createEvent(name: string, userID: string) {
    const cw = moment().week();
    const data = await db.events.create({
        data: {
            name: name,
            user: userID,
            cw: cw
        }
    });
    if(!data) return {} as any;
    return data;
}

export async function eventExists(eventID: string) {
    const data = await db.events.count({
        where: {
            id: eventID
        }
    });
    if(!data) return 0 as number;
    return data;
}

export async function checkINHandler(eventID: string, userID: string) {
    if(await existUserPerID(userID) === 0) return "ErrorNotFound"
    if(await attendanceExists(eventID, userID) > 0) return "ErrorAlreadyCheckedIn"
    if(await eventExists(eventID) === 0) return "ErrorEventNotFound"
    let data = await db.attendance.create({
        data: {
            eventID: eventID,
            userID: userID,
            cw: moment().week(),
        }
    });
    return "success" + data.userID;
}