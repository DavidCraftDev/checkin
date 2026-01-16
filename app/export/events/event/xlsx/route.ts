import { getEventPerID } from "@/lib/events";
import { getUserPerID } from "@/lib/users";
import { NextRequest, NextResponse } from "next/server";
import writeXlsxFile from "write-excel-file/node";
import dayjs from "dayjs";
import getEventXLSX from "@/lib/export/event/xlsx";
import { getCurrentSession } from "@/lib/auth/cookieManager";

export async function GET(request: NextRequest) {
    const { user } = await getCurrentSession();
    if(!user) return new NextResponse(null, { status: 401 });
    if(user.permission < 1) return new NextResponse(null, { status: 403 });
    const eventID = request.nextUrl.searchParams.get("eventID")
    if (!eventID) return NextResponse.json({ error: "No eventID provided" })
    const event = await getEventPerID(eventID)
    if (!event) return NextResponse.json({ error: "Event not found" })
    if ((event.user !== user.id) && (user.permission < 2)) return NextResponse.json({ error: "User not authorized" })
    const eventUser = await getUserPerID(event.user)
    const { sheetData, columnData } = await getEventXLSX(eventUser, event, event.cw, dayjs(event.createdAt).year())
    const bufferData = await writeXlsxFile(sheetData, { buffer: true, sheet: (event.type + " " + dayjs(event.createdAt).format("DD.MM.YYYY")).substring(0, 31), columns: columnData })
    return new NextResponse(new Uint8Array(bufferData), {
        status: 200,
        headers: {
            'Content-Disposition': `attachment; filename="event${event.id}.xlsx"`,
            'Content-Type': 'application/vnd.ms-excel',
        }
    })
}