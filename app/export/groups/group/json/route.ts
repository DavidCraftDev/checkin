import { getSesessionUser } from "@/app/src/modules/authUtilities"
import { getGroupMembersWithAttendances } from "@/app/src/modules/groupUtilities";
import moment from "moment";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const user = await getSesessionUser(1);
    user.password = undefined
    user.loginVersion = undefined

    const currentWeek: number = Number(moment().week())
    const currentYear: number = Number(moment().year())
    const calendarWeek: number = Number(request.nextUrl.searchParams.get("cw")) || currentWeek
    const year: number = Number(request.nextUrl.searchParams.get("year")) || currentYear

    const groupID: string = String(request.nextUrl.searchParams.get("groupID")) || user.group
    if (groupID !== user.group && user.permission < 2) return Response.json({ error: "User not authorized" })

    const group = await getGroupMembersWithAttendances(groupID, calendarWeek, year)
    const data = new Array()
    data.push({
        meta: {
            type: "group",
            exportedEntries: group.length,
            group: groupID,
            requestedBy: user.id,
            calendarWeek: calendarWeek,
            year: year,
            time: new Date()
        }
    })
    data.push(group, user)
    return Response.json(data)
}