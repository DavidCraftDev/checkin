import { Events, User } from "@prisma/client"
import { getAttendancesPerEvent } from "../../eventUtilities"

async function getEventDataJSON(event: Events, user: User) {
    const attendances = await getAttendancesPerEvent(event.id)
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
    data.push({
        eventData: event,
        attendances: attendances
    })
    return data;
}

export default getEventDataJSON;