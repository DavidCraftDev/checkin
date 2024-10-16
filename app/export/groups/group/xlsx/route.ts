import getAttendedEventsXLSX from "@/app/src/modules/export/attendedEvents/xlsx";
import { getGroupMembers } from "@/app/src/modules/groupUtilities";
import { NextRequest, NextResponse } from "next/server";
import { Columns, SheetData } from "write-excel-file";
import writeXlsxFile from "write-excel-file/node";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
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

    const groupID = request.nextUrl.searchParams.get("groupID") || user.group[0]
    if (!groupID) return NextResponse.json({ error: "No groupID provided" })
    if (!user.group.includes(groupID) && user.permission < 2) return NextResponse.json({ error: "User not authorized" })

    const groupMember = await getGroupMembers(groupID, calendarWeek, year)

    const sheetData: SheetData[] = new Array();
    const sheetName: Array<string> = new Array();
    const columeData: Columns[] = new Array();

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
        "value": groupMember.length
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
        "value": "Teilgenomme Studienzeiten",
        "fontWeight": "bold"
    }])
    groupMember.forEach((user) => {
        meta.push([{
            "type": String,
            "value": user.user.displayname,
            "wrap": true
        },
        {
            "type": Number,
            "value": user.attendances,
        }])
    })
    sheetData.push(meta)
    sheetName.push("Meta")
    columeData.push([
        { width: 20 },
        { width: 28 },
        { width: 20 },
        { width: 20 }
    ]);
    await Promise.all(groupMember.map(async (user) => {
        const userData = await getAttendedEventsXLSX(user.user, calendarWeek, year)
        sheetData.push(userData.sheetData)
        sheetName.push(userData.sheetName)
        columeData.push(userData.columnData)
    }))
    const bufferData = await writeXlsxFile(sheetData, { buffer: true, sheets: sheetName, columns: columeData })
    return new NextResponse(bufferData, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="group${calendarWeek + "_" + year + groupID}.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
    })
}