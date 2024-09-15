import { getSessionUser } from "@/app/src/modules/authUtilities"
import { getUserPerID } from "@/app/src/modules/userUtilities";
import writeXlsxFile from "write-excel-file/node";
import { NextRequest, NextResponse } from "next/server";
import getAttendedEventsXLSX from "@/app/src/modules/export/attendedEvents/xlsx";
import { User } from "@prisma/client";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";

dayjs.extend(isoWeek)
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)

export async function GET(request: NextRequest) {
    const user = await getSessionUser();
    let requestUserID = request.nextUrl.searchParams.get("userID")
    let userData: User
    if (requestUserID && (requestUserID !== user.id) && (user.permission < 1)) return NextResponse.json({ error: "Not authorzied" })
    else if (!requestUserID || (requestUserID === user.id)) userData = user
    else userData = await getUserPerID(requestUserID)
    if (!userData.id) return NextResponse.json({ error: "System not found UserID" })
    if (user.permission < 2 && !user.group.some(group => userData.group.includes(group))) return NextResponse.json({ error: "Not authorzied" })
    const cw = Number(request.nextUrl.searchParams.get("cw")) || dayjs().isoWeek()
    const year = Number(request.nextUrl.searchParams.get("year")) || dayjs().year()
    const { sheetData, columnData, sheetName } = await getAttendedEventsXLSX(userData, cw, year)
    const bufferData = await writeXlsxFile(sheetData, { buffer: true, sheet: sheetName, columns: columnData })
    return new NextResponse(bufferData, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="attended_events${cw + "_" + year + userData.id}.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
    })
}