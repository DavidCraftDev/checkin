import { getSessionUser } from "@/app/src/modules/authUtilities"
import { getAttendancesPerEvent, getCreatedEventsPerUser } from "@/app/src/modules/eventUtilities";
import moment from "moment";

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const user = await getSessionUser(1);

    const calendarWeek = Number(request.nextUrl.searchParams.get("cw")) || moment().week()
    const year = Number(request.nextUrl.searchParams.get("year")) || moment().year()

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
            attendance.user.password = null
            attendance.user.loginVersion = 0
        }
        eventsData.push({
            eventData,
            attendances: attendances
        })
    }
    data.push(eventsData)
    return Response.json(data)
}