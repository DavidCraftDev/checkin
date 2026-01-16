import getAttendedEventsXLSX from "@/lib/export/attendedEvents/xlsx";
import { NextRequest, NextResponse } from "next/server";
import { Columns, SheetData } from "write-excel-file";
import writeXlsxFile from "write-excel-file/node";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { getCurrentSession } from "@/lib/auth/cookieManager";
import { getSavedNeededStudyTimes } from "@/lib/studyTime";
import { getGroupUsers } from "@/lib/group";
import { getAttendancesPerUser } from "@/lib/events";

dayjs.extend(isoWeek)
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)

export async function GET(request: NextRequest) {
    const { user } = await getCurrentSession();
    if (!user) return new NextResponse(null, { status: 401 });
    if (user.permission < 1) return new NextResponse(null, { status: 403 });

    const calendarWeek = Number(request.nextUrl.searchParams.get("cw")) || dayjs().isoWeek()
    const year = Number(request.nextUrl.searchParams.get("year")) || dayjs().year()

    const groupID = request.nextUrl.searchParams.get("groupID") || user.groups[0]
    if (!groupID) return NextResponse.json({ error: "No groupID provided" })
    if (!user.groups.includes(groupID) && user.permission < 2) return NextResponse.json({ error: "User not authorized" })

    const groupMember = await getGroupUsers(groupID)

    const sheetData: SheetData[] = [];
    const sheetName: Array<string> = [];
    const columeData: Columns[] = [];

    const meta: SheetData = [];
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
        "value": user.displayName
    },
    {
        "type": String,
        "value": calendarWeek + "/" + year
    }])
    meta.push([{}])
    meta.push([{
        "type": String,
        "value": "Schüler",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Erledigte Studienzeiten:",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Davon Vertretungen:",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Davon nur mit Notizen:",
        "fontWeight": "bold"
    },
    {
        "type": String,
        "value": "Fehlende Studienzeiten:",
        "fontWeight": "bold"
    }])
    await Promise.all(groupMember.map(async (user) => {
        if(user.needs.length === 0 && user.permission !== 0) return;
        const attendances = await getAttendancesPerUser(user.id, calendarWeek, year)
        const studyTimes: Array<string> = [];
        attendances.forEach((attendance) => {
            if (attendance.attendance.type && attendance.attendance.type !== "Unterricht") {
                studyTimes.push(attendance.attendance.type);
            }
        });
        const neededStudyTimes = await getSavedNeededStudyTimes(user, calendarWeek, year);
        const missingStudyTimes = neededStudyTimes.needs.filter((neededStudyTime) => !attendances.find((attendanceData) => attendanceData.attendance.type && attendanceData.attendance.type.replace("Vertretung:", "").replace("Notiz:", "") === neededStudyTime));
        meta.push([{
            "type": String,
            "value": user.displayName,
            "wrap": true
        },
        {
            "type": Number,
            "value": studyTimes.length
        },
        {
            "type": Number,
            "value": studyTimes.filter((studyTime) => studyTime.includes("Vertretung:")).length,
        },
        {
            "type": Number,
            "value": studyTimes.filter((studyTime) => studyTime.includes("Notiz:")).length,
        },
        {
            "type": Number,
            "value": missingStudyTimes.length,
        }])
    }))
    sheetData.push(meta)
    sheetName.push("Meta")
    columeData.push([
        { width: 22 },
        { width: 22 },
        { width: 22 },
        { width: 22 },
        { width: 22 }
    ]);
    await Promise.all(groupMember.map(async (user) => {
        if(user.needs.length === 0 && user.permission !== 0) return;
        const userData = await getAttendedEventsXLSX(user, calendarWeek, year)
        sheetData.push(userData.sheetData)
        sheetName.push(userData.sheetName)
        columeData.push(userData.columnData)
    }))
    const bufferData = await writeXlsxFile(sheetData, { buffer: true, sheets: sheetName, columns: columeData })
    return new NextResponse(new Uint8Array(bufferData), {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="group${calendarWeek + "_" + year + groupID}.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
    })
}