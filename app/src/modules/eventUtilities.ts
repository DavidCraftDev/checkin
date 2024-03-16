import db from "./db";
import { getUserPerID } from "./userUtilities";

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
    const data = await db.attendance.findMany({
        where: {
            eventID: eventID
        }
    });
    if(!data) return [] as any;
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