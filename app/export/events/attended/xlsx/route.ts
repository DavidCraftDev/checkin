// @ts-nocheck
// Error with Buffer in the writeXlsxFile function

import { getSessionUser } from "@/app/src/modules/authUtilities"
import { getUserPerID } from "@/app/src/modules/userUtilities";
import moment from "moment";
import writeXlsxFile from "write-excel-file/node";
import { NextRequest, NextResponse } from "next/server";
import getAttendedEventsXLSX from "@/app/src/modules/export/attendedEvents/xlsx";
import { User } from "@prisma/client";

export async function GET(request: NextRequest) {
    const user = await getSessionUser();
    let requestUserID = request.nextUrl.searchParams.get("userID")
    let userData: User
    if (requestUserID && (requestUserID !== user.id) && (user.permission < 1)) return NextResponse.json({ error: "Not authorzied" })
    else if (!requestUserID || (requestUserID === user.id)) userData = user
    else userData = await getUserPerID(requestUserID)
    if (userData.id && (user.permission < 2 && user.group !== userData.group)) return NextResponse.json({ error: "Not authorzied" })
    if (!userData.id) return NextResponse.json({ error: "System not found UserID" })
    const cw = Number(request.nextUrl.searchParams.get("cw")) || moment().week()
    const year = Number(request.nextUrl.searchParams.get("year")) || moment().year()
    const { sheetData, columnData, sheetName } = await getAttendedEventsXLSX(userData, cw, year)
    const bufferData: any = await writeXlsxFile(sheetData, { buffer: true, sheet: sheetName, columns: columnData })
    return new NextResponse(bufferData, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="attended_events${cw + "_" + year + userData.id}.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
    })
}