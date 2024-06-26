import { getSessionUser } from "@/app/src/modules/authUtilities"
import { getAttendancesPerEvent, getCreatedEventsPerUser } from "@/app/src/modules/eventUtilities";
import moment from "moment";

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const user = await getSessionUser(1);
    user.password = undefined
    user.loginVersion = undefined

    const currentWeek: number = Number(moment().week())
    const currentYear: number = Number(moment().year())
    const calendarWeek: number = Number(request.nextUrl.searchParams.get("cw")) || currentWeek
    const year: number = Number(request.nextUrl.searchParams.get("year")) || currentYear

    const events = await getCreatedEventsPerUser(user.id, calendarWeek, year)
    const data = new Array()
    data.push({
        meta: {
            type: "createdEvents",
            exportedEntries: events.length,
            requestedBy: user.id,
            calendarWeek: calendarWeek,
            year: year,
            time: new Date()
        }
    })
    const eventsData = new Array()
    for (const event of events) {
        let eventData = event.event
        const attendances = await getAttendancesPerEvent(eventData.id)
        for (const attendance of attendances) {
            attendance.user.password = undefined
            attendance.user.loginVersion = undefined
        }
        eventsData.push({
            eventData,
            attendances: attendances
        })
    }
    data.push(eventsData, user)
    return Response.json(data)
}