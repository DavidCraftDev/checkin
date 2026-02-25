import "server-only";

import { getAttendancesPerEvent } from "@/app/src/modules/eventUtilities"
import { Events, User } from "@/app/src/modules/db";
import { AttendancePerEventPerUser } from "@/app/src/interfaces/events";

export interface CreatedEventData {
    meta: {
        type: string,
        exportedEntries: number,
        eventID: string,
        requestedBy: string,
        time: Date
    },
    eventData: Events,
    attendances: AttendancePerEventPerUser[]
}

async function getEventDataJSON(event: Events, user: User): Promise<CreatedEventData> {
    const attendances = await getAttendancesPerEvent(event.id)
    const metaData: CreatedEventData["meta"] = {
        type: "createdEvent",
        exportedEntries: attendances.length,
        eventID: event.id,
        requestedBy: user.id,
        time: new Date()
    }
    const data: CreatedEventData = {
        meta: metaData,
        eventData: event,
        attendances: attendances
    }
    return data;
}

export default getEventDataJSON;