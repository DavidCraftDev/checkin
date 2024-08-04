// @ts-nocheck
// Ignore this file, because error with Buffer in the writeXlsxFile function

import { getSessionUser } from "@/app/src/modules/authUtilities"
import { getUserPerID } from "@/app/src/modules/userUtilities";
import moment from "moment";
import writeXlsxFile from "write-excel-file/node";
import { NextRequest } from "next/server";
import getAttendedEventsXLSX from "@/app/src/modules/export/attendedEvents/xlsx";

export async function GET(request: NextRequest) {
    const user = await getSessionUser();
    let userID = request.nextUrl.searchParams.get("userID")
    let userData
    if (userID && (userID !== user.id) && (user.permission < 1)) {
        return Response.json({ error: "Not authorzied" })
    } else if (!userID || (userID === user.id)) {
        userData = user
        userID = user.id
    } else {
        userData = await getUserPerID(userID)
        userID = userData.id
    }
    if (userID && (user.permission < 2 && user.group !== userData.group)) return Response.json({ error: "Not authorzied" })
    if (!userID) return Response.json({ error: "System not found UserID" })
    const cw = Number(request.nextUrl.searchParams.get("cw")) || moment().week()
    const year = Number(request.nextUrl.searchParams.get("year")) || moment().year()
    const { sheetData, columnData, sheetName } = await getAttendedEventsXLSX(userData, cw, year)
    const bufferData: any = await writeXlsxFile(sheetData, { buffer: true, sheet: sheetName, columns: columnData })
    return new Response(bufferData, {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="attended_events${cw + "_" + year + userData.id}.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
    })
}