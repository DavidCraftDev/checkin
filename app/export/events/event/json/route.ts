import { getSesessionUser } from "@/app/src/modules/authUtilities"
import { getAttendancesPerEvent, getEventPerID } from "@/app/src/modules/eventUtilities";

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const user = await getSesessionUser(1);
    const eventID = request.nextUrl.searchParams.get("eventID")
    if(!eventID) return Response.json({ error: "No eventID provided" })
    const event = await getEventPerID(eventID)
    if(!event.id) return Response.json({ error: "Event not found" })
    if((event.user !== user.id) && (user.permission < 2)) return Response.json({ error: "User not authorized" })
    const attendances = await getAttendancesPerEvent(eventID)
    attendances.forEach((attendance: any) => {
        attendance.user.password = undefined
        attendance.user.loginVersion = undefined
    })
    user.password = undefined
    user.loginVersion = undefined
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