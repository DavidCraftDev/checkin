import { getSessionUser } from "@/app/src/modules/authUtilities"
import { getAttendancesPerEvent, getEventPerID } from "@/app/src/modules/eventUtilities";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";
import { Columns, SheetData } from "write-excel-file";
import writeXlsxFile from "write-excel-file/node";

export async function GET(request: NextRequest) {
    const user = await getSessionUser(1);
    const eventID = request.nextUrl.searchParams.get("eventID")
    if (!eventID) return NextResponse.json({ error: "No eventID provided" })
    const event = await getEventPerID(eventID)
    if (!event) return NextResponse.json({ error: "Event not found" })
    if ((event.user !== user.id) && (user.permission < 2)) return NextResponse.json({ error: "User not authorized" })
    const eventUser = await getUserPerID(event.user)
    const attendances = await getAttendancesPerEvent(eventID)
    const data: SheetData = new Array()
    data.push([{
        "type": String,
        "value": "Veranstaltungen " + event.name,
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
        "value": "Erstellt für:",
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
        "value": eventUser.displayname
    },
    {
        "type": Date,
        "value": new Date(event.created_at),
        "format": "DD.MM.YYYY HH:mm"
    },
    {
        "type": String,
        "value": event.cw + "/" + moment(event.created_at).year()
    },
    {
        "type": Boolean,
        "value": event.studyTime,
    },
    {
        "type": String,
        "value": "Studienzeit:",
        "fontWeight": "bold"
    }])
    data.push([{}])
    data.push([{
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
        data.push([{
            "type": String,
            "value": attendance.user.displayname
        },
        {
            "type": String,
            "value": attendance.attendance.type || "",
            "wrap": true
        },
        {
            "type": String,
            "value": attendance.attendance.studentNote || "",
            "wrap": true
        },
        {
            "type": String,
            "value": attendance.attendance.teacherNote || "",
            "wrap": true
        },
        {
            "type": Date,
            "value": new Date(attendance.attendance.created_at),
            "format": "DD.MM.YYYY HH:mm"
        }])
    })
    const columns: Columns = [
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 }
    ];
    const bufferData = await writeXlsxFile(data, { buffer: true, sheet: event.name.replace("Studienzeit", "SZ"), columns: columns })
    return new NextResponse(bufferData, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="event${event.id}.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
    })
}