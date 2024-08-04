import { getSessionUser } from "@/app/src/modules/authUtilities"
import { studytime } from "@/app/src/modules/config";
import { getAttendancesPerUser } from "@/app/src/modules/eventUtilities";
import { getAttendedStudyTimes, getSavedMissingStudyTimes } from "@/app/src/modules/studytimeUtilities";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import moment from "moment";

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const user = await getSessionUser();
    let userID = request.nextUrl.searchParams.get("userID")
    let userData
    if (userID && (userID !== user.id) && (user.permission < 1)) {
        return Response.json({ error: "Not authorzied" })
    } else if (!userID || (userID === user.id)) {
        userData = user
        userID = user.id
    } else {
        userData = await getUserPerID(userID)
        userID = userData.id
    }
    if (userID && (user.permission < 2 && user.group !== userData.group)) return Response.json({ error: "Not authorzied" })
    if (!userID) return Response.json({ error: "System not found UserID" })
    const cw: number = Number(request.nextUrl.searchParams.get("cw")) || moment().week()
    const year: number = Number(request.nextUrl.searchParams.get("year")) || moment().year()
    const attendances = await getAttendancesPerUser(userID, cw, year)
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
            userID: userID,
            requestedBy: user.id,
            cw: cw,
            year: year,
            time: new Date()
        }
    })
    if (studytime) {
        const studyTimes = await getAttendedStudyTimes(userID, cw, year)
        const missing = await getSavedMissingStudyTimes(userID, cw, year)
        data.push({
            studyTime: {
                attendedStudyTimes: studyTimes,
                missingStudyTimes: missing
            }
        })
    }
    data.push(attendances, user)

    return Response.json({ data })
}