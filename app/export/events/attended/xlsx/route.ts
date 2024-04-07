import { getSesessionUser } from "@/app/src/modules/authUtilities"
import { getAttendancesPerEvent, getAttendancesPerUser, getEventPerID } from "@/app/src/modules/eventUtilities";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import moment from "moment";
import XLSX from "xlsx";

import { NextRequest } from "next/server";
import { buffer } from "stream/consumers";

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
    
    //Convert data to xlsx
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    console.log(data)
    XLSX.utils.book_append_sheet(wb, ws, "attendedEvents");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
    return new Response(buffer, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="test.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
  })
}