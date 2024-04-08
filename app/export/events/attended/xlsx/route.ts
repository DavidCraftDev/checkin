import { getSesessionUser } from "@/app/src/modules/authUtilities"
import { getAttendancesPerUser } from "@/app/src/modules/eventUtilities";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import moment from "moment";
import writeXlsxFile from "write-excel-file/node";
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
    const data = new Array()
    data.push([{
        "type": String,
        "value": "Teilgenommene Veranstalltungen von " + userData.displayname,
        "fontWeight": "bold"
    }])
    data.push([{
        "type": String,
        "value": "Exportiert am:",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Exportierte Einträge:",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Exportiert von:",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Exportiert für:",
        "fontWeight": "bold"
    }])
    data.push([{
        "type": Date,
        "value": new Date(),
        "format": "DD.MM.YYYY HH:mm"
    },
    { 
        "type": Number,
        "value": attendances.length
    },
    {
        "type": String,
        "value": user.displayname
    },
    {
        "type": String,
        "value": cw + "/" + year
    }])
    data.push([{}])
    data.push([{
        "type": String,
        "value": "Veranstaltung",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Lehrer",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Schülernotiz",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Lehrernotiz",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Datum",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Wann hinzugefügt",
        "fontWeight": "bold"
    }])
    attendances.forEach((attendance: any) => {
        data.push([{
            "type": String,
            "value": attendance.event.name,
            "wrap": true
        },
        {
            "type": String,
            "value": attendance.eventUser.displayname
        },
        {
            "type": String,
            "value": attendance.attendance.studentNote,
            "wrap": true
        },
        {
            "type": String,
            "value": attendance.attendance.teacherNote,
            "wrap": true
        },
        {
            "type": Date,
            "value": new Date(attendance.event.created_at),
            "format": "DD.MM.YYYY HH:mm"
        },
        {
            "type": Date,
            "value": new Date(attendance.attendance.created_at),
            "format": "DD.MM.YYYY HH:mm"
        }])
    })
    const columns = [
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 }
      ];
    const bufferData: any = await writeXlsxFile(data, { buffer: true, sheet: userData.displayname, columns: columns } )
    return new Response(bufferData, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="attended_events${cw + "_" + year + userData.id}.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
  })
}