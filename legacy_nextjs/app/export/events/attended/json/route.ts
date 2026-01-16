import getAttendedEventsJSON from "@/app/src/modules/export/attendedEvents/json";
import { getUserPerID } from "@/app/src/modules/userUtilities";
import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
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
    let requestUserID = request.nextUrl.searchParams.get("userID")
    let userData: User
    if (requestUserID && (requestUserID !== user.id) && (user.permission < 1)) return NextResponse.json({ error: "Not authorzied" })
    else if (!requestUserID || (requestUserID === user.id)) userData = user
    else userData = await getUserPerID(requestUserID)
    if (!userData.id) return NextResponse.json({ error: "System not found UserID" })
    if (user.permission < 2 && !user.group.some(group => userData.group.includes(group))) return NextResponse.json({ error: "Not authorzied" })
    const cw = Number(request.nextUrl.searchParams.get("cw")) || dayjs().isoWeek()
    const year = Number(request.nextUrl.searchParams.get("year")) || dayjs().year()
    return NextResponse.json(await getAttendedEventsJSON(user, userData, cw, year))
}