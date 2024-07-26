import { getSessionUser } from "@/app/src/modules/authUtilities"
import { getAttendancesPerEvent, getEventPerID } from "@/app/src/modules/eventUtilities";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const user = await getSessionUser(1);
    const eventID = request.nextUrl.searchParams.get("eventID")
    if (!eventID) return Response.json({ error: "No eventID provided" })
    const event = await getEventPerID(eventID)
    if (!event || !event.id) return Response.json({ error: "Event not found" })
    if ((event.user !== user.id) && (user.permission < 2)) return Response.json({ error: "User not authorized" })
    const attendances = await getAttendancesPerEvent(eventID)
    attendances.forEach((attendance: any) => {
        attendance.user.password = null
        attendance.user.loginVersion = 0
    })
    user.password = null
    user.loginVersion = 0
    const data = new Array()
    data.push({
        meta: {
            type: "event",
            exportedEntries: attendances.length,
            eventID: event.id,
            requestedBy: user.id,
            time: new Date()
        }
    })
    data.push(event, attendances, user)

    return Response.json({ data })
}