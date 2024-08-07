import { getSessionUser } from "@/app/src/modules/authUtilities"
import { getAttendancesPerEvent, getCreatedEventsPerUser } from "@/app/src/modules/eventUtilities";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";
import { Columns, SheetData } from "write-excel-file";
import writeXlsxFile from "write-excel-file/node";

export async function GET(request: NextRequest) {
    const user = await getSessionUser(1);

    const calendarWeek = Number(request.nextUrl.searchParams.get("cw")) || moment().week()
    const year = Number(request.nextUrl.searchParams.get("year")) || moment().year()

    const events = await getCreatedEventsPerUser(user.id, calendarWeek, year)
    const data: SheetData[] = new Array()
    const sheetName: Array<string> = new Array()
    const columeData: Columns[] = new Array()

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
    },
    {
        "type": String,
        "value": "Studienzeit",
        "fontWeight": "bold"
    }])
    for (const event of events) {
        let studyTime = event.event.studyTime ? "✔️" : "❌"
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
        },
        {
            "type": String,
            "value": studyTime
        }])
    }
    data.push(meta)
    sheetName.push("Meta")
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
    }])

    for (const event of events) {
        const attendances = await getAttendancesPerEvent(event.event.id)
        const eventData = new Array()
        eventData.push([{
            "type": String,
            "value": event.event.name,
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
        },
        {
            "type": String,
            "value": "Studienzeit:",
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
        },
        {
            "type": Boolean,
            "value": event.event.studyTime,
        }])
        eventData.push([{}])
        eventData.push([{
            "type": String,
            "value": "Schüler",
            "fontWeight": "bold"
        },
        {
            "type": String,
            "value": "Studienzeit",
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
        attendances.forEach((attendance) => {
            eventData.push([{
                "type": String,
                "value": attendance.user.displayname
            },
            {
                "type": String,
                "value": attendance.attendance.type,
                "wrap": true
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
        if (sheetName.includes(event.event.name.replace("Studienzeit", "SZ").substring(0, 31))) {
            for (let i = 1; i < 999; i++) {
                if (!sheetName.includes(event.event.name.replace("Studienzeit", "SZ").substring(0, 27) + " (" + i + ")")) {
                    sheetName.push(event.event.name.replace("Studienzeit", "SZ").substring(0, 27) + " (" + i + ")")
                    break
                }
            }
        } else {
            sheetName.push(event.event.name.replace("Studienzeit", "SZ").substring(0, 31))
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
        },
        {
            width: 20
        }])
    }

    const bufferData = await writeXlsxFile(data, { buffer: true, sheets: sheetName, columns: columeData })
    return new NextResponse(bufferData, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="created_events${calendarWeek + "_" + year + user.id}.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
    })
}