import { User } from "@prisma/client"
import { getAttendancesPerUser } from "../../eventUtilities"
import { getSavedNeededStudyTimes } from "../../studytimeUtilities";

async function getAttendedEventsJSON(user: User, userData: User, cw: number, year: number) {
    const attendances = await getAttendancesPerUser(userData.id, cw, year)
    const savedNeeds = await getSavedNeededStudyTimes(userData, cw, year);
    const data = new Array()
    data.push({
        meta: {
            type: "attendedEvents",
            exportedEntries: attendances.length,
            userID: userData.id,
            requestedBy: user.id,
            cw: cw,
            year: year,
            time: new Date(),
            needs: savedNeeds.needs
        }
    })
    data.push(attendances)
    return data
}

export default getAttendedEventsJSON;