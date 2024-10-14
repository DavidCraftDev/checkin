import { getCreatedEventsPerUser } from "@/app/src/modules/eventUtilities";
import { NextRequest, NextResponse } from "next/server";
import { Columns, SheetData } from "write-excel-file";
import writeXlsxFile from "write-excel-file/node";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import getEventXLSX from "@/app/src/modules/export/event/xlsx";
import { getCurrentSession } from "@/app/src/modules/auth/cookieManager";

dayjs.extend(isoWeek)
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)

export async function GET(request: NextRequest) {
    const { user } = await getCurrentSession();
    if(!user) return new NextResponse(null, { status: 401 });
    if(user.permission < 1) return new NextResponse(null, { status: 403 });
    const calendarWeek = Number(request.nextUrl.searchParams.get("cw")) || dayjs().isoWeek()
    const year = Number(request.nextUrl.searchParams.get("year")) || dayjs().year()
    const events = await getCreatedEventsPerUser(user.id, calendarWeek, year)

    const sheetData: SheetData[] = new Array()
    const sheetName: Array<string> = new Array()
    const columeData: Columns[] = new Array()
    const meta = new Array()
    meta.push([{
        "type": String,
        "value": "Erstellte Studienzeiten von " + user.displayname,
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
        "value": "Stammfach",
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
            "value": event.event.type
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
    sheetData.push(meta)
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
        const eventData = await getEventXLSX(user, event.event, calendarWeek, year)
        sheetData.push(eventData.sheetData)
        columeData.push(eventData.columnData)
        if (sheetName.includes((event.event.type + " " + dayjs(event.event.created_at).format("DD.MM.YYYY")).substring(0, 31))) {
            for (let i = 1; i < 999; i++) {
                if (!(event.event.type + " " + dayjs(event.event.created_at).format("DD.MM.YYYY")).substring(0, 27) + " (" + i + ")") {
                    sheetName.push((event.event.type + " " + dayjs(event.event.created_at).format("DD.MM.YYYY")).substring(0, 27) + " (" + i + ")")
                    break
                }
            }
        } else {
            sheetName.push((event.event.type + " " + dayjs(event.event.created_at).format("DD.MM.YYYY")).substring(0, 31))
        }
    }

    const bufferData = await writeXlsxFile(sheetData, { buffer: true, sheets: sheetName, columns: columeData })
    return new NextResponse(bufferData, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="created_events${calendarWeek + "_" + year + user.id}.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
    })
}