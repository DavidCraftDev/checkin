import { getSesessionUser } from "@/app/src/modules/authUtilities"
import { getAttendancesPerEvent } from "@/app/src/modules/eventUtilities";
import { getGroupMembersWithAttendances } from "@/app/src/modules/groupUtilities";
import moment from "moment";

import { NextRequest } from "next/server";
import writeXlsxFile from "write-excel-file/node";

export async function GET(request: NextRequest) {
    const user = await getSesessionUser(1);
    user.password = undefined
    user.loginVersion = undefined
    
    const currentWeek: number = Number(moment().week())
    const currentYear: number = Number(moment().year())
    const calendarWeek: number = Number(request.nextUrl.searchParams.get("cw")) || currentWeek
    const year: number = Number(request.nextUrl.searchParams.get("year")) || currentYear

    const groupID: string = String(request.nextUrl.searchParams.get("groupID")) || user.group
    if(groupID !== user.group && user.permission < 2) return Response.json({ error: "User not authorized" })
    
    const group = await getGroupMembersWithAttendances(groupID, calendarWeek, year)
    const data = new Array()
    const sheetData = new Array()
    const columeData = new Array()
    const meta = new Array()
    meta.push([{
        "type": String,
        "value": "Gruppe " + groupID,
        "fontWeight": "bold"
    }])
    meta.push([{
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
    meta.push([{
        "type": Date,
        "value": new Date(),
        "format": "DD.MM.YYYY HH:mm"
    },
    { 
        "type": Number,
        "value": group.length
    },
    {
        "type": String,
        "value": user.displayname
    },
    {
        "type": String,
        "value": calendarWeek + "/" + year
    }])
    meta.push([{}])
    meta.push([{
        "type": String,
        "value": "Mitglied",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Teilgenomme Veranstalltungen",
        "fontWeight": "bold"
    }])
    group.forEach((user: any) => {
        meta.push([{
            "type": String,
            "value": user.user.displayname,
            "wrap": true
        },
        {
            "type": Number,
            "value": user.attendances.length,
        }])
    })
    data.push(meta)
    sheetData.push("Meta")
    columeData.push([
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 }
      ]);
    for (const userGroup of group) {
        const userData = new Array()
        userData.push([{
            "type": String,
            "value": "Teilgenommene Veranstalltungen von " + userGroup.user.displayname,
            "fontWeight": "bold"
        }])
        userData.push([{
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
        userData.push([{
            "type": Date,
            "value": new Date(),
            "format": "DD.MM.YYYY HH:mm"
        },
        { 
            "type": Number,
            "value": userGroup.attendances.length
        },
        {
            "type": String,
            "value": user.displayname
        },
        {
            "type": String,
            "value": calendarWeek + "/" + year
        }])
        userData.push([{}])
        userData.push([{
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
        userGroup.attendances.forEach((attendance: any) => {
            userData.push([{
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
        data.push(userData)
        if(sheetData.includes(userGroup.user.displayname)) {
            for(let i = 1; i < 9999; i++) {
                if(!sheetData.includes(userGroup.user.displayname + " (" + i + ")")) {
                    sheetData.push(userGroup.user.displayname + " (" + i + ")" )
                    break
                }
        } 
        } else {
            sheetData.push(userGroup.user.displayname)
        }
        columeData.push([
            { width: 20 },
            { width: 20 },
            { width: 20 },
            { width: 20 },
            { width: 20 },
            { width: 20 }
          ]);
    }
    const bufferData: any = await writeXlsxFile(data, { buffer: true, sheets: sheetData, columns: columeData } )
    return new Response(bufferData, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="group${calendarWeek + "_" + year + groupID}.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
  })
  }