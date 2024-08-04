import { User } from "@prisma/client"
import { getAttendancesPerUser } from "../../eventUtilities"
import { getAttendedStudyTimes, getSavedMissingStudyTimes } from "../../studytimeUtilities"

async function getAttendedEventsJSON(user: User, userData: User, cw: number, year: number, studytime: boolean) {
    const attendances = await getAttendancesPerUser(userData.id, cw, year)
    attendances.forEach((attendance) => {
        attendance.eventUser.password = null
        attendance.eventUser.loginVersion = 0
    })
    user.password = null
    user.loginVersion = 0
    const data = new Array()
    data.push({
        meta: {
            type: "attendedEvents",
            exportedEntries: attendances.length,
            userID: userData.id,
            requestedBy: user.id,
            cw: cw,
            year: year,
            time: new Date()
        }
    })
    if (studytime) {
        const attendedStudyTimes = await getAttendedStudyTimes(userData.id, cw, year)
        const missingStudyTimes = await getSavedMissingStudyTimes(userData.id, cw, year)
        data.push({
            studyTime: {
                attendedStudyTimes: attendedStudyTimes,
                missingStudyTimes: missingStudyTimes
            }
        })
    }
    data.push(attendances)
    return data
}

export default getAttendedEventsJSON;