import { getSessionUser } from "@/app/src/modules/authUtilities"
import { getCreatedEventsPerUser } from "@/app/src/modules/eventUtilities";
import getEventDataJSON from "@/app/src/modules/export/event/json";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const user = await getSessionUser(1);

    const calendarWeek = Number(request.nextUrl.searchParams.get("cw")) || moment().isoWeekYear()
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
    await Promise.all(events.map(async (event) => eventsData.push(await getEventDataJSON(event.event, user))))
    data.push(eventsData)
    return NextResponse.json(data)
}