import { getSessionUser } from "@/app/src/modules/authUtilities"
import { studytime } from "@/app/src/modules/config";
import getAttendedEventsJSON from "@/app/src/modules/export/attendedEvents/json";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import { User } from "@prisma/client";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const user = await getSessionUser();
    let requestUserID = request.nextUrl.searchParams.get("userID")
    let userData: User
    if (requestUserID && (requestUserID !== user.id) && (user.permission < 1)) return NextResponse.json({ error: "Not authorzied" })
    else if (!requestUserID || (requestUserID === user.id)) userData = user
    else userData = await getUserPerID(requestUserID)
    if (!userData.id) return NextResponse.json({ error: "System not found UserID" })
    if (user.permission < 2 && user.group !== userData.group) return NextResponse.json({ error: "Not authorzied" })
    const cw = Number(request.nextUrl.searchParams.get("cw")) || moment().week()
    const year = Number(request.nextUrl.searchParams.get("year")) || moment().year()
    return NextResponse.json(await getAttendedEventsJSON(user, userData, cw, year, studytime))
}