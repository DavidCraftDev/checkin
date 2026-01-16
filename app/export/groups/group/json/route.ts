import getAttendedEventsJSON from "@/lib/export/attendedEvents/json";
import { getGroupMembers } from "@/lib/groups";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
import { getCurrentSession } from "@/lib/auth/cookieManager";

dayjs.extend(isoWeek)
dayjs.extend(isoWeeksInYear)
dayjs.extend(isLeapYear)

export async function GET(request: NextRequest) {
    const { user } = await getCurrentSession();
    if(!user) return new NextResponse(null, { status: 401 });
    if(user.permission < 1) return new NextResponse(null, { status: 403 });

    const calendarWeek = Number(request.nextUrl.searchParams.get("cw")) || dayjs().isoWeek()
    const year = Number(request.nextUrl.searchParams.get("year")) || dayjs().year()

    const groupID = String(request.nextUrl.searchParams.get("groupID")) || user.groups[0]
    if (!groupID) return NextResponse.json({ error: "No groupID provided" })
    if (!user.groups.includes(groupID) && user.permission < 2) return NextResponse.json({ error: "User not authorized" })
    const groupMember = await getGroupMembers(groupID, calendarWeek, year)
    const groupMemberData: any[] = new Array()
    await Promise.all(groupMember.map(async (member) => groupMemberData.push(await getAttendedEventsJSON(user, member.user, calendarWeek, year))))
    const data = new Array()
    data.push({
        meta: {
            type: "group",
            exportedEntries: groupMember.length,
            group: groupID,
            requestedBy: user.id,
            calendarWeek: calendarWeek,
            year: year,
            time: new Date()
        }
    })
    data.push(groupMemberData)
    return NextResponse.json(data)
}