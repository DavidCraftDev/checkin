import { getSessionUser } from "@/app/src/modules/authUtilities"
import { studytime } from "@/app/src/modules/config";
import getAttendedEventsJSON from "@/app/src/modules/export/attendedEvents/json";
import { getGroupMembers } from "@/app/src/modules/groupUtilities";
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const user = await getSessionUser(1);

    const calendarWeek = Number(request.nextUrl.searchParams.get("cw")) || moment().isoWeekYear()
    const year = Number(request.nextUrl.searchParams.get("year")) || moment().year()

    const groupID = String(request.nextUrl.searchParams.get("groupID")) || user.group
    if (!groupID) return NextResponse.json({ error: "No groupID provided" })
    if (groupID !== user.group && user.permission < 2) return NextResponse.json({ error: "User not authorized" })

    const groupMember = await getGroupMembers(groupID, calendarWeek, year)
    const groupMemberData: any[] = new Array()
    await Promise.all(groupMember.map(async (member) => groupMemberData.push(await getAttendedEventsJSON(user, member.user, calendarWeek, year, studytime))))
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