import { getSesessionUser } from "@/app/src/modules/authUtilities"
import { getAttendancesPerEvent, getAttendancesPerUser, getEventPerID } from "@/app/src/modules/eventUtilities";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import moment from "moment";

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const user = await getSesessionUser();
    let userID = request.nextUrl.searchParams.get("userID")
    let userData
    if(userID && (userID !== user.id) && (user.permission < 1)) {
        return Response.json({ error: "Not authorzied"})
    } else if (!userID || (userID === user.id)) {
        userData = user
        userID = user.id
    } else {
        userData = await getUserPerID(userID)
        userID = userData.id
    }
    if(userID && (user.permission < 2 && user.group !== userData.group)) return Response.json({ error: "Not authorzied"})
    if(!userID) return Response.json({ error: "System not found UserID" })
    const cw: number = Number(request.nextUrl.searchParams.get("cw")) || moment().week()
    const year: number = Number(request.nextUrl.searchParams.get("year")) || moment().year()
    const attendances = await getAttendancesPerUser(userID, cw, year)
    attendances.forEach((attendance: any) => {
        attendance.eventUser.password = undefined
        attendance.eventUser.loginVersion = undefined
    })
    user.password = undefined
    user.loginVersion = undefined
    const data = new Array()
    data.push({
        meta: {
            type: "attendedEvents",
            exportedEntries: attendances.length,
            userID: userID,
            requestedBy: user.id,
            time: new Date()
        }
    })
    data.push(attendances, user)
   
    return Response.json({ data })
  }