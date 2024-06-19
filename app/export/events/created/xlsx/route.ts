import { getSessionUser } from "@/app/src/modules/authUtilities"
import { getAttendancesPerEvent, getCreatedEventsPerUser } from "@/app/src/modules/eventUtilities";
import moment from "moment";
import { NextRequest } from "next/server";
import writeXlsxFile from "write-excel-file/node";

export async function GET(request: NextRequest) {
    const user = await getSessionUser(1);
    user.password = undefined
    user.loginVersion = undefined

    const currentWeek: number = Number(moment().week())
    const currentYear: number = Number(moment().year())
    const calendarWeek: number = Number(request.nextUrl.searchParams.get("cw")) || currentWeek
    const year: number = Number(request.nextUrl.searchParams.get("year")) || currentYear

    const events = await getCreatedEventsPerUser(user.id, calendarWeek, year)
    const data = new Array()
    const sheetData = new Array()
    const columeData = new Array()

    //Push Meta Data to a own sheet
    const meta = new Array()
    meta.push([{
        "type": String,
        "value": "Erstellte Veranstaltungen von " + user.displayname,
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
        "value": events.length
    },
    {
        "type": String,
        "value": calendarWeek + "/" + year
    }])
    meta.push([{}])
    meta.push([{
        "type": String,
        "value": "Veranstaltung",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Teilnehmer",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Erstellt am",
        "fontWeight": "bold"
    }])
    for (const event of events) {
        meta.push([{
            "type": String,
            "value": event.event.name
        },
        {
            "type": Number,
            "value": event.user
        },
        {
            "type": Date,
            "value": new Date(event.event.created_at),
            "format": "DD.MM.YYYY HH:mm"
        }])
    }
    data.push(meta)
    sheetData.push("Meta")
    columeData.push([{
        width: 20
    },
    {
        width: 20
    },
    {
        width: 20
    }])

    //Add for each event a new sheet
    for (const event of events) {
        const attendances = await getAttendancesPerEvent(event.event.id)
        const eventData = new Array()
        eventData.push([{
            "type": String,
            "value": "Veranstaltungen " + event.event.name,
            "fontWeight": "bold"
        }])
        eventData.push([{
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
            "value": "Lehrer:",
            "fontWeight": "bold"
        },
        {
            "type": String,
            "value": "Erstellt am:",
            "fontWeight": "bold"
        },
        {
            "type": String,
            "value": "Event CW/Jahr:",
            "fontWeight": "bold"
        }])
        eventData.push([{
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
            "type": Date,
            "value": new Date(event.event.created_at),
            "format": "DD.MM.YYYY HH:mm"
        },
        {
            "type": String,
            "value": calendarWeek + "/" + year
        }])
        eventData.push([{}])
        eventData.push([{
            "type": String,
            "value": "Schüler",
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
            "value": "Wann hinzugefügt",
            "fontWeight": "bold"
        }])
        attendances.forEach((attendance: any) => {
            eventData.push([{
                "type": String,
                "value": attendance.user.displayname
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
                "value": new Date(attendance.attendance.created_at),
                "format": "DD.MM.YYYY HH:mm"
            }])
        })
        data.push(eventData)
        if (sheetData.includes(event.event.name)) {
            for (let i = 1; i < 9999; i++) {
                if (!sheetData.includes(event.event.name + " (" + i + ")")) {
                    sheetData.push(event.event.name + " (" + i + ")")
                    break
                }
            }
        } else {
            sheetData.push(event.event.name)
        }
        columeData.push([{
            width: 20
        },
        {
            width: 20
        },
        {
            width: 20
        },
        {
            width: 20
        },
        {
            width: 20
        }])
    }

    const bufferData: any = await writeXlsxFile(data, { buffer: true, sheets: sheetData, columns: columeData })
    return new Response(bufferData, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="created_events${calendarWeek + "_" + year + user.id}.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
    })
}